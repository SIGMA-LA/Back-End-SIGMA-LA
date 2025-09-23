import { UsoMaquinariaRepository } from './usoMaquinaria.repository'
import { uso_maquinaria, Prisma } from '@prisma/client'

/**
 * Servicio para gestionar las operaciones relacionadas con los usos de maquinaria.
 * @class UsoMaquinariaService
 * @method create - Crea una nueva uso de maquinaria.
 * @method findAll - Obtiene todas las maquinaria por uso.
 * @method findById - Obtiene una maquinaria por uso por su código.
 * @method update - Actualiza un uso de maquinaria por su uso existente.
 * @method remove - Elimina un uso de maquinaria por su código.
 * @returns {Promise<uso_vehiculo_visita | uso_vehiculo_visita[]>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class UsoMaquinariaService {
  private repository: UsoMaquinariaRepository

  constructor() {
    this.repository = new UsoMaquinariaRepository()
  }

  async create(
    data: Prisma.uso_maquinariaCreateInput,
  ): Promise<uso_maquinaria> {
    return await this.repository.create(data)
  }

  async findAll(): Promise<uso_maquinaria[]> {
    return this.repository.findAll()
  }

  async findById(
    cod_maquina: number,
    cod_entrega: number,
  ): Promise<uso_maquinaria | null> {
    return await this.repository.findById(cod_maquina, cod_entrega)
  }

  async update(
    cod_maquina: number,
    cod_entrega: number,
    data: Prisma.uso_maquinariaUpdateInput,
  ): Promise<uso_maquinaria> {
    return await this.repository.update(cod_maquina, cod_entrega, data)
  }

  async remove(
    cod_maquina: number,
    cod_entrega: number,
  ): Promise<uso_maquinaria> {
    const existingUso = await this.repository.findById(cod_maquina, cod_entrega)
    if (!existingUso) {
      throw new Error('Uso de vehículo por visita no encontrado')
    }
    return await this.repository.delete(cod_maquina, cod_entrega)
  }
}
