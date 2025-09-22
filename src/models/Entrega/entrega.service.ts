import { EntregaRepository } from './entrega.repository.js'
import { entrega, Prisma } from '@prisma/client'

/**
 * Servicio para manejar la lógica de negocio de entregas.
 * @class EntregaService
 * @method create - Crea una nueva entrega.
 * @method findAll - Obtiene todas las entregas.
 * @method findById - Obtiene una entrega por cod_entrega.
 * @method update - Actualiza una entrega existente.
 * @method delete - Elimina una entrega por su cod_entrega.
 * @returns {Promise<entrega | entrega[] | number | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */

export class EntregaService {
  private entregaRepository: EntregaRepository

  constructor() {
    this.entregaRepository = new EntregaRepository()
  }

  async create(data: Prisma.entregaCreateInput): Promise<entrega> {
    const fechaISO = new Date(data.fecha_hora_entrega as string).toISOString()
    return this.entregaRepository.create({
      ...data,
      fecha_hora_entrega: fechaISO,
    })
  }

  async findAll(): Promise<entrega[]> {
    return this.entregaRepository.findAll()
  }

  async findById(cod_entrega: number): Promise<entrega | null> {
    return this.entregaRepository.findById(cod_entrega)
  }

  async update(
    cod_entrega: number,
    data: Prisma.entregaUpdateInput,
  ): Promise<entrega> {
    if (data.fecha_hora_entrega) {
      const fechaISO = new Date(data.fecha_hora_entrega as string).toISOString()
      data.fecha_hora_entrega = fechaISO
    }
    return this.entregaRepository.update(cod_entrega, data)
  }

  async delete(cod_entrega: number): Promise<entrega> {
    return this.entregaRepository.delete(cod_entrega)
  }
}
