import { presupuesto, Prisma } from '@prisma/client'
import { PresupuestoRepository } from './presupuesto.repository.js'
import { AppError } from '../../shared/errors/AppError.js'
import { ValidationError } from '../../shared/errors/validationError.js'
import { prisma } from '../../shared/db/prismaClient.js'

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

    await this.validarVigencia(data.fecha_emision as Date, data.fecha_aceptacion as Date | null)

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
      throw new AppError('Presupuesto no encontrado', 404, 'PRESUPUESTO_NOT_FOUND')
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

    await this.validarVigencia(data.fecha_emision as Date, data.fecha_aceptacion as Date | null)

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

  /**
   * Validates that the difference between emission and acceptance dates
   * does not exceed the allowed days in system parameters.
   */
  private async validarVigencia(fechaEmision: Date | undefined, fechaAceptacion: Date | null | undefined): Promise<void> {
    if (!fechaEmision || !fechaAceptacion) return

    const parametroActual = await prisma.parametro.findFirst({
      orderBy: [{ fecha_cambio: 'desc' }, { hora_cambio: 'desc' }],
    })

    if (!parametroActual) return

    const diasVigencia = parametroActual.dias_vigencia_presu
    const fEmision = new Date(fechaEmision)
    const fAceptacion = new Date(fechaAceptacion)

    const utc1 = Date.UTC(fEmision.getUTCFullYear(), fEmision.getUTCMonth(), fEmision.getUTCDate())
    const utc2 = Date.UTC(fAceptacion.getUTCFullYear(), fAceptacion.getUTCMonth(), fAceptacion.getUTCDate())

    const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24))

    if (diffDays > diasVigencia) {
      throw new ValidationError(
        `El presupuesto no puede ser aceptado porque han transcurrido ${diffDays} días desde su emisión, superando el límite de ${diasVigencia} días permitido.`,
        'PRESUPUESTO_EXPIRADO'
      )
    }
  }
}

