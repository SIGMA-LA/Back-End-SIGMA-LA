import { pago, Prisma } from '@prisma/client'
import { PagoRepository } from './pago.repository.js'
import { prisma } from '../../shared/db/prismaClient.js'
import { AppError } from '../../shared/errors/AppError.js'
import { ValidationError } from '../../shared/errors/validationError.js'
import { eventBus } from '../../shared/events/eventBus.js'

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
        'El monto del pago debe ser un número válido mayor a cero.',
        'INVALID_PAYMENT_AMOUNT'
      )
    }

    const resultado = await prisma.$transaction(async tx => {
      const obra = await tx.obra.findUnique({
        where: { cod_obra },
        include: { pago: true, presupuesto: true },
      })

      if (!obra) {
        throw new AppError('La obra no existe.', 404, 'OBRA_NOT_FOUND')
      }

      const presupuestoAceptado = obra.presupuesto.find(
        p => p.fecha_aceptacion !== null,
      )

      if (!presupuestoAceptado) {
        throw new ValidationError(
          'No se puede registrar el pago. La obra no tiene un presupuesto aceptado.',
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
            `El primer pago debe ser exactamente el 70% del presupuesto (${montoRequerido.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}).`,
            'INVALID_FIRST_PAYMENT'
          )
        }
      }

      if (nuevoMonto > montoRestante + 0.01) {
        throw new ValidationError(
          `El monto del pago (${nuevoMonto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}) excede el saldo restante (${montoRestante.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}).`,
          'PAYMENT_EXCEEDS_BALANCE'
        )
      }

      const esPagoFinal = nuevoTotalPagado >= totalPresupuestado - 0.01

      if (esPagoFinal && obra.estado !== 'PRODUCCION FINALIZADA') {
        throw new ValidationError(
          'El pago total solo puede registrarse si el estado del proyecto es "PRODUCCION FINALIZADA".',
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

      return { pago: nuevoPago, esPagoFinal }
    })

    if (resultado.esPagoFinal) {
      eventBus.emit('obra.pagada_totalmente', { cod_obra })
    }

    return resultado.pago
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
      throw new AppError('Pago no encontrado', 404, 'PAGO_NOT_FOUND')
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

  /**
   * Retrieves billing statistics for the current and previous month.
   */
  async getFacturacionStats(): Promise<{ ingresosMes: number; ingresosMesPasado: number; porcentajeCrecimiento: number }> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    const ingresosMesAggregate = await prisma.pago.aggregate({
      where: {
        fecha_pago: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { monto: true },
    })
    const ingresosMes = Number(ingresosMesAggregate._sum.monto || 0)

    const ingresosMesPrevAggregate = await prisma.pago.aggregate({
      where: {
        fecha_pago: {
          gte: startOfPrevMonth,
          lte: endOfPrevMonth,
        },
      },
      _sum: { monto: true },
    })
    const ingresosMesPasado = Number(ingresosMesPrevAggregate._sum.monto || 0)
    
    let porcentajeCrecimiento = 0
    if (ingresosMesPasado > 0) {
      porcentajeCrecimiento = ((ingresosMes - ingresosMesPasado) / ingresosMesPasado) * 100
    } else if (ingresosMes > 0) {
      porcentajeCrecimiento = 100
    }

    return {
      ingresosMes,
      ingresosMesPasado,
      porcentajeCrecimiento: Math.round(porcentajeCrecimiento * 10) / 10,
    }
  }
}

