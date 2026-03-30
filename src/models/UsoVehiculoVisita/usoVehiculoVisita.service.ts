import { uso_vehiculo_visita, Prisma } from '@prisma/client'
import { UsoVehiculoVisitaRepository } from './usoVehiculoVisita.repository.js'

/**
 * Servicio para gestionar las operaciones relacionadas con los usos de vehículos por visita.
 * @class UsoVehiculoVisitaService
 * @method create - Crea un nuevo uso de vehículo por visita.
 * @method findAll - Obtiene todos los usos de vehículos por visita.
 * @method findById - Obtiene un uso de vehículo por visita por su código.
 * @method update - Actualiza un uso de vehículo por visita existente.
 * @method remove - Elimina un uso de vehículo por visita por su código.
 * @returns {Promise<uso_vehiculo_visita | uso_vehiculo_visita[]>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class UsoVehiculoVisitaService {
  private repository: UsoVehiculoVisitaRepository

  constructor() {
    this.repository = new UsoVehiculoVisitaRepository()
  }

  async create(
    data: Prisma.uso_vehiculo_visitaCreateInput,
  ): Promise<uso_vehiculo_visita> {
    return await this.repository.create(data)
  }

  async findAll(): Promise<uso_vehiculo_visita[]> {
    return this.repository.findAll()
  }

  async findById(
    cod_visita: number,
    patente: string,
  ): Promise<uso_vehiculo_visita | null> {
    return await this.repository.findById(patente, cod_visita)
  }

  async update(
    cod_visita: number,
    patente: string,
    data: Prisma.uso_vehiculo_visitaUpdateInput,
  ): Promise<uso_vehiculo_visita> {
    return await this.repository.update(patente, cod_visita, data)
  }

  async delete(
    cod_visita: number,
    patente: string,
  ): Promise<uso_vehiculo_visita> {
    const existingUso = await this.repository.findById(patente, cod_visita)
    if (!existingUso) {
      throw new Error('Uso de vehículo en visita no encontrado')
    }
    return await this.repository.delete(patente, cod_visita)
  }
}
