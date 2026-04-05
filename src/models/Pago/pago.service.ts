import { pago, Prisma } from '@prisma/client'
import { PagoRepository } from './pago.repository.js'
import { prisma } from '../../shared/db/prismaClient.js'
import { AppError } from '../../shared/errors/AppError.js'
import { ValidationError } from '../../shared/errors/validationError.js'

/**
 * Service to manage payment (pago) operations.
 */
export class PagoService {
  private repository: PagoRepository

  constructor() {
    this.repository = new PagoRepository()
  }

  /**
   * Creates a new payment for a specific construction project (obra).
   * Includes business logic for payment validation against budget.
   * @param cod_obra The project code.
   * @param data The payment data.
   * @returns The created payment.
   */
  async createForObra(
    cod_obra: number,
    data: Omit<Prisma.pagoUncheckedCreateInput, 'cod_obra'>,
  ): Promise<pago> {
    const nuevoMonto = Number(data.monto)

    if (isNaN(nuevoMonto) || nuevoMonto <= 0) {
      throw new ValidationError(
        'Payment amount must be a valid number greater than zero.',
        'INVALID_PAYMENT_AMOUNT'
      )
    }

    const pagoCreado = await prisma.$transaction(async tx => {
      const obra = await tx.obra.findUnique({
        where: { cod_obra },
        include: { pago: true, presupuesto: true },
      })

      if (!obra) {
        throw new AppError('The obra does not exist.', 404, 'OBRA_NOT_FOUND')
      }

      const presupuestoAceptado = obra.presupuesto.find(
        p => p.fecha_aceptacion !== null,
      )

      if (!presupuestoAceptado) {
        throw new ValidationError(
          'Cannot register payment. The obra does not have an accepted budget.',
          'MISSING_ACCEPTED_BUDGET'
        )
      }

      const totalPresupuestado = presupuestoAceptado.valor
      const totalPagadoAnteriormente = obra.pago.reduce(
        (sum, p) => sum + p.monto,
        0,
      )
      const nuevoTotalPagado = totalPagadoAnteriormente + nuevoMonto
      const montoRestante = totalPresupuestado - totalPagadoAnteriormente

      if (obra.pago.length === 0) {
        const montoRequerido = totalPresupuestado * 0.7
        // Check equivalence with 0.01 tolerance due to float precision
        if (Math.abs(nuevoMonto - montoRequerido) > 0.01) {
          throw new ValidationError(
            `The first payment must be exactly 70% of the budget (${montoRequerido.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}).`,
            'INVALID_FIRST_PAYMENT'
          )
        }
      }

      if (nuevoMonto > montoRestante + 0.01) {
        throw new ValidationError(
          `Payment amount (${nuevoMonto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}) exceeds the remaining balance (${montoRestante.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}).`,
          'PAYMENT_EXCEEDS_BALANCE'
        )
      }

      const esPagoFinal = nuevoTotalPagado >= totalPresupuestado - 0.01

      if (esPagoFinal && obra.estado !== 'PRODUCCION FINALIZADA') {
        throw new ValidationError(
          'Total payment can only be registered if the project status is "PRODUCCION FINALIZADA".',
          'INVALID_STATE_FOR_FINAL_PAYMENT'
        )
      }

      const nuevoPago = await tx.pago.create({
        data: {
          monto: nuevoMonto,
          fecha_pago: new Date(),
          obra: { connect: { cod_obra: cod_obra } },
        },
      })

      let nuevoEstadoObra = obra.estado

      if (esPagoFinal) {
        nuevoEstadoObra = 'PAGADA TOTALMENTE'
      } else if (nuevoTotalPagado > 0) {
        nuevoEstadoObra = 'PAGADA PARCIALMENTE'
      }

      if (obra.estado !== nuevoEstadoObra) {
        await tx.obra.update({
          where: { cod_obra },
          data: { estado: nuevoEstadoObra },
        })
      }

      return nuevoPago
    })

    return pagoCreado
  }

  /**
   * Creates a basic payment entry.
   */
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

  /**
   * Gets all payments with optional filtering.
   */
  async findAll(filters?: {
    search?: string
    cliente?: string
    fechaDesde?: string
    fechaHasta?: string
    obra?: string
    montoMin?: number
    montoMax?: number
  }) {
    let pagos;
    if (filters && Object.keys(filters).length > 0) {
      pagos = await this.repository.findAllWithFilters(filters)
    } else {
      pagos = await this.repository.findAll()
    }

    return pagos.map(pago => ({
      ...pago,
      fecha_pago: pago.fecha_pago.toISOString().split('T')[0],
      obra: {
        ...pago.obra,
        cliente: {
          ...pago.obra.cliente,
          cuil: this.formatCUIL(pago.obra.cliente.cuil),
        },
      },
    }))
  }

  /**
   * Formats a CUIL string to XX-XXXXXXXX-X format.
   */
  private formatCUIL(cuil: string): string {
    if (cuil.length === 11) {
      return `${cuil.slice(0, 2)}-${cuil.slice(2, 10)}-${cuil.slice(10)}`
    }
    return cuil
  }

  /**
   * Gets a payment by its ID.
   */
  async findById(id: number): Promise<pago> {
    const entry = await this.repository.findById(id)
    if (!entry) {
      throw new AppError('Payment not found', 404, 'PAGO_NOT_FOUND')
    }
    return entry
  }

  /**
   * Updates an existing payment.
   */
  async update(id: number, data: Prisma.pagoUpdateInput): Promise<pago> {
    await this.findById(id) // Ensure existence
    let fecha_pago = data.fecha_pago
    if (
      typeof fecha_pago === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(fecha_pago)
    ) {
      fecha_pago = new Date(fecha_pago)
    }
    return await this.repository.update(id, { ...data, fecha_pago })
  }

  /**
   * Deletes a payment by its ID.
   */
  async remove(id: number): Promise<pago> {
    await this.findById(id)
    return await this.repository.delete(id)
  }

  /**
   * Gets all payments associated with a specific construction project.
   */
  async findByObra(cod_obra: number): Promise<pago[]> {
    return await this.repository.findManyByObra(cod_obra)
  }
}

