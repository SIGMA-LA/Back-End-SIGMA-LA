import { orden_de_produccion, Prisma } from '@prisma/client'
import { OrdenProduccionRepository } from './ordenProduccion.repository.js'

/**
 * Servicio para gestionar las operaciones relacionadas con las órdenes de producción.
 * @class OrdenProduccionService
 * @method create - Crea una nueva orden de producción.
 * @method findAll - Obtiene todas las órdenes de producción.
 * @method findById - Obtiene una orden de producción por su código.
 * @method update - Actualiza una orden de producción existente.
 * @method remove - Elimina una orden de producción por su código.
 * @returns {Promise<orden_de_produccion | orden_de_produccion[]>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class OrdenProduccionService {
  private repository: OrdenProduccionRepository

  constructor() {
    this.repository = new OrdenProduccionRepository()
  }

  async create(
    data: Prisma.orden_de_produccionCreateInput,
  ): Promise<orden_de_produccion> {
    return await this.repository.create(data)
  }

  async findAll(): Promise<orden_de_produccion[]> {
    return this.repository.findAll()
  }

  async findById(cod_op: number): Promise<orden_de_produccion | null> {
    return await this.repository.findById(cod_op)
  }

  async update(
    cod_op: number,
    data: Prisma.orden_de_produccionUpdateInput,
  ): Promise<orden_de_produccion> {
    return await this.repository.update(cod_op, data)
  }

  async remove(cod_op: number): Promise<orden_de_produccion> {
    const existingOrden = await this.repository.findById(cod_op)
    if (!existingOrden) {
      throw new Error(
        'No existe una orden de producción con el código proporcionado.',
      )
    }
    return await this.repository.delete(cod_op)
  }
}
