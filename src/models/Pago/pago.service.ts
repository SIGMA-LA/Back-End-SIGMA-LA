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

  async create(data: Prisma.pagoCreateInput): Promise<pago> {
    return await this.repository.create(data)
  }

  async findAll(): Promise<pago[]> {
    return this.repository.findAll()
  }

  async findById(cod_pago: number): Promise<pago | null> {
    return await this.repository.findById(cod_pago)
  }

  async update(cod_pago: number, data: Prisma.pagoUpdateInput): Promise<pago> {
    return await this.repository.update(cod_pago, data)
  }

  async remove(cod_pago: number): Promise<pago> {
    const existingPago = await this.repository.findById(cod_pago)
    if (!existingPago) {
      throw new Error('No existe un pago con el código proporcionado.')
    }
    return await this.repository.delete(cod_pago)
  }
}
