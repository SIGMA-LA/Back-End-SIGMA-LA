import { Prisma, maquinaria } from '@prisma/client'
import { MaquinariaRepository } from './maquinaria.repository'

/**
 * Servicio para manejar operaciones CRUD de maquinaria.
 * @class MaquinariaService
 * @method create - Crea una nueva maquinaria.
 * @method findAll - Obtiene todas las maquinarias.
 * @method findById - Obtiene una maquinaria por su código.
 * @method update - Actualiza una maquinaria existente.
 * @method remove - Elimina una maquinaria por su código.
 * @returns {Promise<maquinaria | maquinaria[] | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class MaquinariaService {
  private repository: MaquinariaRepository

  constructor() {
    this.repository = new MaquinariaRepository()
  }

  async create(data: Prisma.maquinariaCreateInput): Promise<maquinaria> {
    try {
      return await this.repository.create(data)
    } catch (error) {
      throw new Error(`Error al crear la maquinaria: ${error}`)
    }
  }

  async findAll(): Promise<maquinaria[]> {
    return this.repository.findAll()
  }

  async findById(cod_maquina: number): Promise<maquinaria | null> {
    try {
      return await this.repository.findById(cod_maquina)
    } catch (error) {
      throw new Error(`Error al obtener maquinaria: ${error}`)
    }
  }

  async update(
    cod_maquina: number,
    data: Prisma.maquinariaUpdateInput,
  ): Promise<maquinaria> {
    return await this.repository.update(cod_maquina, data)
  }

  async remove(cod_maquina: number): Promise<maquinaria> {
    try {
      const existingMaquinaria = await this.repository.findById(cod_maquina)
      if (!existingMaquinaria) {
        throw new Error('No existe una maquinaria con el código proporcionado.')
      }
      return await this.repository.delete(cod_maquina)
    } catch (error) {
      throw new Error(`Error al eliminar la maquinaria: ${error}`)
    }
  }
}
