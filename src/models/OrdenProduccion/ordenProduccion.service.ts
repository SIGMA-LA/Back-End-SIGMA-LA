import { orden_de_produccion, Prisma } from '@prisma/client'
import {
  OrdenProduccionFilters,
  OrdenProduccionRepository,
} from './ordenProduccion.repository.js'
import { prisma } from '../../shared/db/prismaClient.js'
import { AppError } from '../../shared/errors/AppError.js'
import { ValidationError } from '../../shared/errors/validationError.js'
import { eventBus } from '../../shared/events/eventBus.js'
import type { PaginationParams, PaginatedResponse } from '../../shared/types/pagination.js'

interface OrdenProduccionCreateInput {
  cod_obra: number | string
  url?: string | null
  public_id?: string | null
  fecha_validacion?: Date | string | null
}

interface UploadedOrdenFile {
  path?: string
  filename?: string
}

/**
 * Service to manage production orders (orden de producción).
 */
export class OrdenProduccionService {
  private repository: OrdenProduccionRepository

  constructor() {
    this.repository = new OrdenProduccionRepository()
  }

  /**
   * Creates a new production order.
   */
  async create(
    data: OrdenProduccionCreateInput,
    uploadedFile?: UploadedOrdenFile,
  ): Promise<orden_de_produccion> {
    const codObra = Number(data.cod_obra)
    if (!Number.isInteger(codObra) || codObra <= 0) {
      throw new ValidationError('Código de obra inválido', 'INVALID_ID')
    }

    // Validar que la obra existe y tiene el estado correcto para crear una OP
    const obra = await prisma.obra.findUnique({ where: { cod_obra: codObra } })
    if (!obra) {
      throw new ValidationError(`Obra no encontrada (ID: ${codObra})`, 'OBRA_NOT_FOUND')
    }
    if (obra.estado !== 'PAGADA PARCIALMENTE' && obra.estado !== 'EN ESPERA DE STOCK' && obra.estado !== 'EN PRODUCCION') {
      throw new ValidationError(
        'La obra asociada a esta orden de producción no tiene el estado adecuado para crear una orden.',
        'INVALID_STATE'
      )
    }

    const normalizedUrl = (uploadedFile?.path ?? data.url ?? '').trim()
    if (!normalizedUrl) {
      throw new ValidationError('No se ha subido ningún archivo', 'FILE_REQUIRED')
    }

    const fechaValidacion = this.parseFechaValidacion(data.fecha_validacion)

    const prismaData: Prisma.orden_de_produccionCreateInput = {
      obra: {
        connect: { cod_obra: codObra },
      },
      fecha_confeccion: new Date(),
      fecha_validacion: fechaValidacion,
      url: normalizedUrl,
      public_id: uploadedFile?.filename ?? data.public_id ?? null,
    }

    const nuevaOrden = await this.repository.create(prismaData)

    // Desacoplado: Emitir evento para que el sistema de notificaciones reaccione
    eventBus.emit('orden_produccion.creada', nuevaOrden)

    return nuevaOrden
  }

  private parseFechaValidacion(value: Date | string | null | undefined): Date | null {
    if (!value) return null

    const parsedDate = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(parsedDate.getTime())) {
      throw new ValidationError('Fecha de validación inválida', 'INVALID_DATE')
    }

    return parsedDate
  }

  /**
   * Gets all production orders with optional filters.
   */
  async findAll(
    filters?: OrdenProduccionFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<orden_de_produccion> | orden_de_produccion[]> {
    const { data, total } = await this.repository.findAll(filters, pagination)

    if (pagination) {
      return {
        data,
        total,
        totalPages: Math.ceil(total / pagination.pageSize),
        page: pagination.page,
        pageSize: pagination.pageSize,
      }
    }

    return data
  }

  /**
   * Gets a production order by its ID.
   */
  async findById(cod_op: number): Promise<orden_de_produccion> {
    const entry = await this.repository.findById(cod_op)
    if (!entry) {
      throw new AppError('Orden de producción no encontrada', 404, 'ORDEN_NOT_FOUND')
    }
    return entry
  }

  /**
   * Gets all validated production orders.
   */
  async findAprobadas(): Promise<orden_de_produccion[]> {
    return await this.repository.findAprobadas()
  }

  /**
   * Gets all production orders currently in production.
   */
  async findEnProduccion(): Promise<orden_de_produccion[]> {
    return await this.repository.findEnProduccion()
  }

  /**
   * Updates an existing production order.
   */
  async update(
    cod_op: number,
    data: Prisma.orden_de_produccionUpdateInput,
  ): Promise<orden_de_produccion> {
    const orden = await this.findById(cod_op) // Ensure existence

    // Si la orden estaba rechazada, al resubir el archivo (update) 
    // la volvemos a PENDIENTE y limpiamos el motivo
    if (orden.estado === 'RECHAZADA') {
      data.estado = 'PENDIENTE'
      data.motivo_rechazo = null
      data.fecha_confeccion = new Date()
    }

    const nuevaOrden = await this.repository.update(cod_op, data)

    // Emitir evento si la orden de producción acaba de ser aprobada
    if (orden.estado !== 'APROBADA' && nuevaOrden.estado === 'APROBADA') {
      eventBus.emit('orden_produccion.aprobada', nuevaOrden)
    }

    return nuevaOrden
  }
  
  /**
   * Marks a production order as authorized (approved).
   */
  async aprobar(cod_op: number): Promise<orden_de_produccion> {
    const orden = await this.findById(cod_op)
    if (orden.estado !== 'PENDIENTE' && orden.estado !== 'RECHAZADA') {
      throw new ValidationError(
        'Solo las órdenes en estado "Pendiente" o "Rechazada" pueden ser aprobadas.',
        'INVALID_STATE'
      )
    }
    const ordenActualizada = await this.repository.update(cod_op, { 
      estado: 'APROBADA',
      motivo_rechazo: null // Limpiamos por las dudas
    })
    return ordenActualizada
  }

  /**
   * Rejects a production order with a reason.
   */
  async rechazar(cod_op: number, motivo: string): Promise<orden_de_produccion> {
    const orden = await this.findById(cod_op)
    
    if (orden.estado !== 'PENDIENTE') {
      throw new ValidationError(
        'Solo las órdenes en estado "Pendiente" pueden ser rechazadas.',
        'INVALID_STATE'
      )
    }

    if (!motivo || motivo.trim().length === 0) {
      throw new ValidationError('Debe proporcionar un motivo para el rechazo.', 'MOTIVO_REQUIRED')
    }

    const ordenActualizada = await this.repository.update(cod_op, {
      estado: 'RECHAZADA',
      motivo_rechazo: motivo
    })

    return ordenActualizada
  }


  /**
   * Deletes a production order by its ID.
   */
  async remove(cod_op: number): Promise<orden_de_produccion> {
    await this.findById(cod_op)
    return await this.repository.delete(cod_op)
  }

  /**
   * Gets production orders associated with a specific obra.
   */
  async findByObra(cod_obra: number): Promise<orden_de_produccion[]> {
    return await this.repository.findByObra(cod_obra)
  }

  /**
   * Gets finished production orders associated with a specific obra.
   */
  async findByObraAndFinalizada(cod_obra: number): Promise<orden_de_produccion[]> {
    return await this.repository.findByObraAndFinalizada(cod_obra)
  }

  /**
   * Marks a production order as finished.
   */
  async finalizarProduccion(cod_op: number): Promise<orden_de_produccion> {
    const orden = await this.findById(cod_op)

    if (orden.estado !== 'EN PRODUCCION') {
      throw new ValidationError(
        'Solo las órdenes que están "En Producción" pueden ser finalizadas.',
        'INVALID_STATE'
      )
    }

    const ordenActualizada = await prisma.orden_de_produccion.update({
      where: { cod_op },
      data: { estado: 'FINALIZADA' },
    })

    return ordenActualizada
  }

  /**
   * Marks a production order as starting production and updates the associated obra.
   */
  async iniciarProduccion(cod_op: number): Promise<orden_de_produccion> {
    const orden = await this.findById(cod_op)
    const obra = await prisma.obra.findUnique({ where: { cod_obra: orden.cod_obra } })
    if (obra?.estado === 'EN ESPERA DE STOCK') {
      throw new ValidationError(
        'La obra asociada a esta orden de producción se encuentra en espera de stock.',
        'INVALID_OBRA_STATE'
      )
    }

    if (orden.estado !== 'APROBADA') {
      throw new ValidationError(
        'Solo las órdenes "Aprobadas" pueden iniciar producción.',
        'INVALID_STATE'
      )
    }

    const [ordenActualizada] = await prisma.$transaction([
      prisma.orden_de_produccion.update({
        where: { cod_op },
        data: { estado: 'EN PRODUCCION' },
        include: {
          obra: {
            include: {
              cliente: true,
              localidad: true,
            },
          },
        },
      }),
      prisma.obra.update({
        where: { cod_obra: orden.cod_obra },
        data: { estado: 'EN PRODUCCION' },
      }),
    ])

    eventBus.emit('obra.cambio_estado', {
      cod_obra: orden.cod_obra,
      nuevo_estado: 'EN PRODUCCION'
    })

    return ordenActualizada
  }
}

