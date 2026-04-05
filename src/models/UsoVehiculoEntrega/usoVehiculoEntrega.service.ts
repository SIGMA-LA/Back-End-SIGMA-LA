import { uso_vehiculo_entrega, Prisma } from '@prisma/client'
import { UsoVehiculoEntregaRepository } from './usoVehiculoEntrega.repository.js'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Servicio para gestionar las operaciones relacionadas con los usos de vehículos por entrega.
 */
export class UsoVehiculoEntregaService {
  private repository: UsoVehiculoEntregaRepository

  constructor() {
    this.repository = new UsoVehiculoEntregaRepository()
  }

  async create(
    data: Prisma.uso_vehiculo_entregaCreateInput,
  ): Promise<uso_vehiculo_entrega> {
    return await this.repository.create(data)
  }

  async findAll(): Promise<uso_vehiculo_entrega[]> {
    return this.repository.findAll()
  }

  async findById(
    cod_entrega: number,
    patente: string,
  ): Promise<uso_vehiculo_entrega> {
    const uso = await this.repository.findById(cod_entrega, patente)
    if (!uso) {
      throw new AppError('Uso de vehículo por entrega no encontrado', 404, 'USO_VEHICULO_ENTREGA_NOT_FOUND')
    }
    return uso
  }

  async update(
    cod_entrega: number,
    patente: string,
    data: Prisma.uso_vehiculo_entregaUpdateInput,
  ): Promise<uso_vehiculo_entrega> {
    await this.findById(cod_entrega, patente)
    return await this.repository.update(cod_entrega, patente, data)
  }

  async remove(
    cod_entrega: number,
    patente: string,
  ): Promise<uso_vehiculo_entrega> {
    await this.findById(cod_entrega, patente)
    return await this.repository.delete(cod_entrega, patente)
  }
}
