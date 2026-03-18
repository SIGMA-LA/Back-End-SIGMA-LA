import { pago, Prisma } from '@prisma/client'
import { PagoRepository } from './pago.repository.js'
import { prisma } from '../../shared/db/prismaClient.js'

/*
type PagoConRelaciones = Prisma.pagoGetPayload<{
  include: {
    obra: {
      include: {
        cliente: true
      }
    }
  }
}>
*/

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
    const nuevoMonto = Number(data.monto)

    if (isNaN(nuevoMonto) || nuevoMonto <= 0) {
      throw new Error(
        'El monto del pago debe ser un número válido y mayor a cero.',
      )
    }

    const pagoCreado = await prisma.$transaction(async tx => {
      const obra = await tx.obra.findUnique({
        where: { cod_obra },
        include: { pago: true, presupuesto: true },
      })

      if (!obra) {
        throw new Error('La obra no existe.')
      }

      const presupuestoAceptado = obra.presupuesto.find(
        p => p.fecha_aceptacion !== null,
      )

      if (!presupuestoAceptado) {
        throw new Error(
          'No se puede registrar un pago. La obra no tiene un presupuesto aceptado.',
        )
      }

      const totalPresupuestado = presupuestoAceptado.valor
      const totalPagadoAnteriormente = obra.pago.reduce(
        (sum, p) => sum + p.monto,
        0,
      )
      const nuevoTotalPagado = totalPagadoAnteriormente + nuevoMonto
      const montoRestante = totalPresupuestado - totalPagadoAnteriormente

      if (nuevoMonto > montoRestante + 0.01) {
        throw new Error(
          `El monto del pago (${nuevoMonto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}) excede el saldo restante (${montoRestante.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}).`,
        )
      }

      const esPagoFinal = nuevoTotalPagado >= totalPresupuestado - 0.01

      if (esPagoFinal && obra.estado !== 'PRODUCCION FINALIZADA') {
        throw new Error(
          'El pago total solo puede registrarse si el estado de la obra es "PRODUCCION FINALIZADA".',
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

  async findAll(filters?: {
    search?: string
    cliente?: string
    fechaDesde?: string
    fechaHasta?: string
    obra?: string
    montoMin?: number
    montoMax?: number
  }) {
    let pagos
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

  private formatCUIL(cuil: string): string {
    if (cuil.length === 11) {
      return `${cuil.slice(0, 2)}-${cuil.slice(2, 10)}-${cuil.slice(10)}`
    }
    return cuil
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
