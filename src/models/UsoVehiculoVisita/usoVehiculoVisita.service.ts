import { uso_vehiculo_visita, Prisma } from '@prisma/client'
import { UsoVehiculoVisitaRepository } from './usoVehiculoVisita.repository.js'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Servicio para gestionar las operaciones relacionadas con los usos de vehículos por visita.
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
  ): Promise<uso_vehiculo_visita> {
    const uso = await this.repository.findById(patente, cod_visita)
    if (!uso) {
      throw new AppError('Uso de vehículo por visita no encontrado', 404, 'USO_VEHICULO_VISITA_NOT_FOUND')
    }
    return uso
  }

  async update(
    cod_visita: number,
    patente: string,
    data: Prisma.uso_vehiculo_visitaUpdateInput,
  ): Promise<uso_vehiculo_visita> {
    await this.findById(cod_visita, patente)
    return await this.repository.update(patente, cod_visita, data)
  }

  async remove(
    cod_visita: number,
    patente: string,
  ): Promise<uso_vehiculo_visita> {
    await this.findById(cod_visita, patente)
    return await this.repository.delete(patente, cod_visita)
  }
}
