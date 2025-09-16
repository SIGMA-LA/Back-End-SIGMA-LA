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
    return await this.repository.create(data)
  }

  async findAll(): Promise<obra[]> {
    return this.repository.findAll()
  }

  async findById(cod_obra: number): Promise<obra | null> {
    return await this.repository.findById(cod_obra)
  }

  async update(cod_obra: number, data: Prisma.obraUpdateInput): Promise<obra> {
    return await this.repository.update(cod_obra, data)
  }

  async remove(cod_obra: number): Promise<obra> {
    const existingObra = await this.repository.findById(cod_obra)
    if (!existingObra) {
      throw new Error('No existe una obra con el código proporcionado.')
    }
    return await this.repository.delete(cod_obra)
  }
}
