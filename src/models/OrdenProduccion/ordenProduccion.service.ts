import { orden_de_produccion, Prisma } from '@prisma/client'
import {
  OrdenProduccionFilters,
  OrdenProduccionRepository,
} from './ordenProduccion.repository.js'
import { prisma } from '../../shared/db/prismaClient.js'
import { AppError } from '../../shared/errors/AppError.js'
import { ValidationError } from '../../shared/errors/validationError.js'

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

    return await this.repository.create(prismaData)
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
  ): Promise<orden_de_produccion[]> {
    return this.repository.findAll(filters)
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
    await this.findById(cod_op) // Ensure existence
    return await this.repository.update(cod_op, data)
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

    const [ordenActualizada] = await prisma.$transaction([
      prisma.orden_de_produccion.update({
        where: { cod_op },
        data: { estado: 'FINALIZADA' },
      }),
    ])

    console.log(
      `[NOTIFICATION] Production of Order #${orden.cod_op} has finished. Notifying Coordination.`,
    )

    return ordenActualizada
  }

  /**
   * Marks a production order as starting production.
   */
  async iniciarProduccion(cod_op: number): Promise<orden_de_produccion> {
    const orden = await this.findById(cod_op)

    if (orden.estado !== 'APROBADA') {
      throw new ValidationError(
        'Solo las órdenes "Aprobadas" pueden iniciar producción.',
        'INVALID_STATE'
      )
    }

    return await this.repository.update(cod_op, { estado: 'EN PRODUCCION' })
  }
}

