import { pago, Prisma } from '@prisma/client'
import { PagoRepository } from './pago.repository.js'

/**
 * Servicio para gestionar las operaciones relacionadas con los pagos.
 * @class PagoService
 * @method create - Crea un nuevo pago.
 * @method findAll - Obtiene todos los pagos.
 * @method findById - Obtiene un pago por su código.
 * @method update - Actualiza un pago existente.
 * @method remove - Elimina un pago por su código.
 * @returns {Promise<pago | pago[]>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class PagoService {
  private repository: PagoRepository

  constructor() {
    this.repository = new PagoRepository()
  }

  async createForObra(
    cod_obra: number,
    data: Omit<Prisma.pagoUncheckedCreateInput, 'cod_obra'>,
  ): Promise<pago> {
    let fecha_pago = data.fecha_pago
    if (
      typeof fecha_pago === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(fecha_pago)
    ) {
      fecha_pago = new Date(fecha_pago)
    }
    return await this.repository.createForObra({
      ...data,
      cod_obra,
      fecha_pago,
    })
  }

  async createOne(data: Prisma.pagoCreateInput): Promise<pago> {
    let fecha_pago = data.fecha_pago
    if (
      typeof fecha_pago === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(fecha_pago)
    ) {
      fecha_pago = new Date(fecha_pago)
    }
    return await this.repository.createOne({ ...data, fecha_pago })
  }

  async findAll(): Promise<pago[]> {
    return await this.repository.findAll()
  }

  async findById(id: number): Promise<pago | null> {
    return await this.repository.findById(id)
  }

  async update(id: number, data: Prisma.pagoUpdateInput): Promise<pago> {
    let fecha_pago = data.fecha_pago
    if (
      typeof fecha_pago === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(fecha_pago)
    ) {
      fecha_pago = new Date(fecha_pago)
    }
    return await this.repository.update(id, { ...data, fecha_pago })
  }

  async remove(id: number): Promise<pago> {
    const existingPago = await this.repository.findById(id)
    if (!existingPago) {
      throw new Error('No existe un pago con el código proporcionado.')
    }
    return await this.repository.delete(id)
  }

  async findByObra(cod_obra: number): Promise<pago[]> {
    return await this.repository.findManyByObra(cod_obra)
  }
}
