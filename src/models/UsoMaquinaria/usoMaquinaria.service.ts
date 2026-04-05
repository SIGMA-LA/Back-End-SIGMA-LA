import { UsoMaquinariaRepository } from './usoMaquinaria.repository.js'
import { uso_maquinaria, Prisma } from '@prisma/client'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Servicio para gestionar las operaciones relacionadas con los usos de maquinaria.
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
  ): Promise<uso_maquinaria> {
    const uso = await this.repository.findById(cod_maquina, cod_entrega)
    if (!uso) {
      throw new AppError('Uso de maquinaria no encontrado', 404, 'USO_MAQUINARIA_NOT_FOUND')
    }
    return uso
  }

  async update(
    cod_maquina: number,
    cod_entrega: number,
    data: Prisma.uso_maquinariaUpdateInput,
  ): Promise<uso_maquinaria> {
    await this.findById(cod_maquina, cod_entrega)
    return await this.repository.update(cod_maquina, cod_entrega, data)
  }

  async remove(
    cod_maquina: number,
    cod_entrega: number,
  ): Promise<uso_maquinaria> {
    await this.findById(cod_maquina, cod_entrega)
    return await this.repository.delete(cod_maquina, cod_entrega)
  }
}
