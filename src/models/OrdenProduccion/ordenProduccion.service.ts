import { orden_de_produccion, Prisma } from '@prisma/client'
import {
  OrdenProduccionFilters,
  OrdenProduccionRepository,
} from './ordenProduccion.repository.js'
import { prisma } from '../../shared/db/prismaClient.js'
import { AppError } from '../../shared/errors/AppError.js'
import { ValidationError } from '../../shared/errors/validationError.js'
import { eventBus } from '../../shared/events/eventBus.js'

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
  async create(data: {
    cod_obra: number
    url: string
    public_id: string
    fecha_validacion?: Date | null
  }): Promise<orden_de_produccion> {
    const prismaData: Prisma.orden_de_produccionCreateInput = {
      obra: {
        connect: { cod_obra: data.cod_obra },
      },
      fecha_confeccion: new Date(),
      fecha_validacion: data.fecha_validacion || null,
      url: data.url,
      public_id: data.public_id,
    }

    const nuevaOrden = await this.repository.create(prismaData)

    // Desacoplado: Emitir evento para que el sistema de notificaciones reaccione
    eventBus.emit('orden_produccion.creada', nuevaOrden)

    return nuevaOrden
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
  async findValidadas(): Promise<orden_de_produccion[]> {
    return await this.repository.findValidadas()
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

    if (orden.estado !== 'VALIDADA') {
      throw new ValidationError(
        'Solo las órdenes "Validadas" pueden iniciar producción.',
        'INVALID_STATE'
      )
    }

    return await this.repository.update(cod_op, { estado: 'EN PRODUCCION' })
  }
}

