import { uso_vehiculo_entrega, Prisma } from '@prisma/client'
import { UsoVehiculoEntregaRepository } from './usoVehiculoEntrega.repository.js'

/**
 * Servicio para gestionar las operaciones relacionadas con los usos de vehículos por entrega.
 * @class UsoVehiculoEntregaService
 * @method create - Crea un nuevo uso de vehículo por entrega.
 * @method findAll - Obtiene todos los usos de vehículos por entrega.
 * @method findById - Obtiene un uso de vehículo por entrega por su código.
 * @method update - Actualiza un uso de vehículo por entrega existente.
 * @method remove - Elimina un uso de vehículo por entrega por su código.
 * @returns {Promise<uso_vehiculo_entrega | uso_vehiculo_entrega[]>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
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
    cod_uso_vehiculo_entrega: number,
  ): Promise<uso_vehiculo_entrega | null> {
    return await this.repository.findById(cod_uso_vehiculo_entrega)
  }

  async update(
    cod_uso_vehiculo_entrega: number,
    data: Prisma.uso_vehiculo_entregaUpdateInput,
  ): Promise<uso_vehiculo_entrega> {
    return await this.repository.update(cod_uso_vehiculo_entrega, data)
  }

  async remove(
    cod_uso_vehiculo_entrega: number,
  ): Promise<uso_vehiculo_entrega> {
    const existingUso = await this.repository.findById(cod_uso_vehiculo_entrega)
    if (!existingUso) {
      throw new Error('Uso de vehículo por entrega no encontrado')
    }
    return await this.repository.delete(cod_uso_vehiculo_entrega)
  }
}
