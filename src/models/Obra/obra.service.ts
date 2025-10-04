import { obra, Prisma } from '@prisma/client'
import { ObraRepository } from './obra.repository.js'

/**
 * Servicio para gestionar las operaciones relacionadas con las obras.
 * @class ObraService
 * @method create - Crea una nueva obra.
 * @method findAll - Obtiene todas las obras.
 * @method findById - Obtiene una obra por su código.
 * @method update - Actualiza una obra existente.
 * @method remove - Elimina una obra por su código.
 * @returns {Promise<obra | obra[]>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class ObraService {
  private repository: ObraRepository

  constructor() {
    this.repository = new ObraRepository()
  }

  async create(data: Prisma.obraCreateInput): Promise<obra> {
    if (
      typeof data.fecha_ini === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_ini)
    ) {
      data.fecha_ini = new Date(data.fecha_ini + 'T00:00:00.000Z')
    }

    if (
      typeof data.fecha_cancelacion === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_cancelacion)
    ) {
      data.fecha_cancelacion = new Date(
        data.fecha_cancelacion + 'T00:00:00.000Z',
      )
    }
    return await this.repository.create(data)
  }

  async findAll(): Promise<obra[]> {
    return this.repository.findAll()
  }

  async findById(id: number): Promise<obra | null> {
    return await this.repository.findById(id)
  }

  async update(id: number, data: Prisma.obraUpdateInput): Promise<obra> {
    if (
      typeof data.fecha_ini === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_ini)
    ) {
      data.fecha_ini = new Date(data.fecha_ini + 'T00:00:00.000Z')
    }

    if (
      typeof data.fecha_cancelacion === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_cancelacion)
    ) {
      data.fecha_cancelacion = new Date(
        data.fecha_cancelacion + 'T00:00:00.000Z',
      )
    }

    return await this.repository.update(id, data)
  }

  async remove(id: number): Promise<obra> {
    const existingObra = await this.repository.findById(id)
    if (!existingObra) {
      throw new Error('No existe una obra con el código proporcionado.')
    }
    return await this.repository.delete(id)
  }
}
