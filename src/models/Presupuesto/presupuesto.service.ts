import { presupuesto, Prisma } from '@prisma/client'
import { PresupuestoRepository } from './presupuesto.repository.js'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Service to manage budget (presupuesto) operations.
 */
export class PresupuestoService {
  private repository: PresupuestoRepository

  constructor() {
    this.repository = new PresupuestoRepository()
  }

  /**
   * Creates a new budget record.
   * @param data The budget data.
   * @returns The created budget.
   */
  async create(data: Prisma.presupuestoCreateInput): Promise<presupuesto> {
    if (
      typeof data.fecha_emision === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_emision)
    ) {
      data.fecha_emision = new Date(data.fecha_emision + 'T00:00:00.000Z')
    }

    if (
      typeof data.fecha_aceptacion === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_aceptacion)
    ) {
      data.fecha_aceptacion = new Date(data.fecha_aceptacion + 'T00:00:00.000Z')
    }
    return await this.repository.create(data)
  }

  /**
   * Gets all budget records.
   * @returns A list of all budgets.
   */
  async findAll(): Promise<presupuesto[]> {
    return await this.repository.findAll()
  }

  /**
   * Finds a specific budget by its ID (nro_presupuesto).
   * @param nro_presupuesto The budget number.
   * @returns The found budget.
   */
  async findById(nro_presupuesto: number): Promise<presupuesto> {
    const entry = await this.repository.findById(nro_presupuesto)
    if (!entry) {
      throw new AppError('Budget not found', 404, 'PRESUPUESTO_NOT_FOUND')
    }
    return entry
  }

  /**
   * Updates an existing budget record.
   * @param nro_presupuesto The budget number to update.
   * @param data The new data for the budget.
   * @returns The updated budget.
   */
  async update(
    nro_presupuesto: number,
    data: Prisma.presupuestoUpdateInput,
  ): Promise<presupuesto> {
    if (
      typeof data.fecha_emision === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_emision)
    ) {
      data.fecha_emision = new Date(data.fecha_emision + 'T00:00:00.000Z')
    }

    if (
      typeof data.fecha_aceptacion === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_aceptacion)
    ) {
      data.fecha_aceptacion = new Date(data.fecha_aceptacion + 'T00:00:00.000Z')
    }

    await this.findById(nro_presupuesto) // Ensure existence
    return await this.repository.update(nro_presupuesto, data)
  }

  /**
   * Deletes a budget record.
   * @param nro_presupuesto The budget number to delete.
   * @returns The deleted budget.
   */
  async remove(nro_presupuesto: number): Promise<presupuesto> {
    await this.findById(nro_presupuesto)
    return await this.repository.delete(nro_presupuesto)
  }
}

