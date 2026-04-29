import { obra, Prisma } from '@prisma/client'
import {
  NotasFabricaFilters,
  ObraRepository,
} from './obra.repository.js'
import { AppError } from '../../shared/errors/AppError.js'
import { ValidationError } from '../../shared/errors/validationError.js'
import type { PaginationParams, PaginatedResponse } from '../../shared/types/pagination.js'
import { prisma } from '../../shared/db/prismaClient.js'
import { eventBus } from '../../shared/events/eventBus.js'

type ObraCreateInputExtended = Prisma.obraCreateInput & {
  cuil?: string
  cuil_cliente?: string
  cuil_arquitecto?: string
  cod_localidad?: number
  presupuestos?: {
    valor: number
    fecha_emision?: string | Date
    fecha_aceptacion?: string | Date
  }[]
}

type ObraUpdateInputExtended = Prisma.obraUpdateInput & {
  cuil?: string
  cuil_cliente?: string
  cuil_arquitecto?: string | null
  cod_localidad?: number | string
}

/**
 * Service to manage obra (construction project) operations.
 */
export class ObraService {
  private repository: ObraRepository

  constructor() {
    this.repository = new ObraRepository()
  }

  // ----------- FILTERS AND SEARCHES -----------

  /**
   * Filters obras by status, location, or both.
   */
  async filtrar(
    filtros: { estado?: string; cod_localidad?: number },
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<obra>> {
    const { data, total } = await this.repository.filtrar(filtros, pagination)
    return {
      data,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }

  /**
   * Searches obras by text (address, client, etc.).
   */
  async buscar(q: string, pagination: PaginationParams): Promise<PaginatedResponse<obra>> {
    if (!q) return this.findAll(pagination)
    const { data, total } = await this.repository.buscar(q, pagination)
    return {
      data,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }

  /**
   * Gets obras for a specific client.
   */
  async findByCliente(cuil_cliente: string): Promise<obra[]> {
    return this.repository.findByCliente(cuil_cliente)
  }

  /**
   * Gets all obras (paginated).
   */
  async findAll(pagination: PaginationParams): Promise<PaginatedResponse<obra>> {
    const { data, total } = await this.repository.findAll(pagination)
    return {
      data,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }

  /**
   * Gets an obra by its ID.
   */
  async findById(id: number): Promise<obra> {
    const entry = await this.repository.findById(id)
    if (!entry) {
      throw new AppError(`Obra no encontrada (ID: ${id})`, 404, 'OBRA_NOT_FOUND')
    }
    return entry
  }

  // ----------- FACTORY NOTE (NOTAS DE FÁBRICA) -----------

  /**
   * Gets obras for the factory notes screen.
   */
  async findNotasFabrica(filtros: NotasFabricaFilters): Promise<obra[]> {
    return this.repository.findNotasFabrica(filtros)
  }

  /**
   * Uploads a factory note file to an obra.
   */
  async subirNotaFabrica(
    id: number,
    file: Express.Multer.File,
  ): Promise<obra> {
    await this.findById(id) // Ensure existence
    return this.repository.subirNotaFabrica(id, file.path, file.filename)
  }

  /**
   * Deletes the factory note from an obra.
   */
  async deleteNotaFabrica(id: number): Promise<obra> {
    await this.findById(id) // Ensure existence
    return this.repository.update(id, {
      nota_fabrica: null,
      nota_fabrica_pid: null,
    })
  }

  /**
   * Gets obras with factory notes but without an approved order.
   */
  async findNotasSinOrdenAprobada(): Promise<obra[]> {
    return await this.repository.findNotasSinOrdenAprobada()
  }

  /**
   * Gets obras with factory notes and order in process.
   */
  async findNotasConOrdenEnProceso(): Promise<obra[]> {
    return await this.repository.findNotasConOrdenEnProceso()
  }

  // ----------- OBRA CRUD -----------

  /**
   * Creates a new construction project (obra).
   */
  async create(data: ObraCreateInputExtended): Promise<obra> {
    const {
      cuil,
      cuil_cliente,
      cuil_arquitecto,
      cod_localidad,
      presupuestos,
      ...rest
    } = data

    /**
     * Normalizes a date value (string 'YYYY-MM-DD' or Date) to a Date object.
     * Appends 'T00:00:00.000Z' to bare date strings to satisfy Prisma's
     * ISO-8601 DateTime requirement (Prisma rejects 'YYYY-MM-DD' alone).
     */
    const toDate = (value: string | Date | undefined | null): Date | null => {
      if (!value) return null
      if (value instanceof Date) return value
      // If it's already a full ISO string, parse directly
      if (value.includes('T')) return new Date(value)
      // Bare date string: append UTC midnight time
      return new Date(`${value}T00:00:00.000Z`)
    }

    // Handle budgeting data from multiple potential keys and cast dates.
    // The frontend sends { presupuesto: { create: [...] } } (Prisma-shaped),
    // which lands in `rest`. We intercept it here, parse dates, and rebuild it.
    let parsedPresupuestosCreate = undefined

    const rawPresupuestoCreate = (rest as Record<string, unknown>).presupuesto as
      | { create?: { valor: number; fecha_emision?: string | Date; fecha_aceptacion?: string | Date; nro_presupuesto?: number }[] }
      | undefined

    if (presupuestos && Array.isArray(presupuestos)) {
      // Legacy path: array sent as top-level `presupuestos`
      parsedPresupuestosCreate = presupuestos.map((p) => ({
        valor: p.valor,
        fecha_emision: toDate(p.fecha_emision) ?? new Date(),
        fecha_aceptacion: toDate(p.fecha_aceptacion),
      }))
      // Remove from rest to avoid Prisma conflict
      delete (rest as Record<string, unknown>).presupuesto
    } else if (rawPresupuestoCreate?.create && Array.isArray(rawPresupuestoCreate.create)) {
      // Primary path: { presupuesto: { create: [...] } } sent by the frontend action
      parsedPresupuestosCreate = rawPresupuestoCreate.create.map((p) => ({
        valor: p.valor,
        fecha_emision: toDate(p.fecha_emision) ?? new Date(),
        fecha_aceptacion: toDate(p.fecha_aceptacion),
      }))
      // Remove from rest so we can rebuild it with parsed dates below
      delete (rest as Record<string, unknown>).presupuesto
    }

    const prismaData: Prisma.obraCreateInput = {
      ...rest,
      ...((cuil || cuil_cliente) && {
        cliente: { connect: { cuil: cuil || cuil_cliente } },
      }),
      ...(cuil_arquitecto && {
        arquitecto: { connect: { cuil: cuil_arquitecto } },
      }),
      ...(cod_localidad && {
        localidad: { connect: { cod_localidad: Number(cod_localidad) } },
      }),
      ...(parsedPresupuestosCreate && {
        presupuesto: {
          create: parsedPresupuestosCreate,
        },
      }),
    }

    if (
      typeof prismaData.fecha_ini === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(prismaData.fecha_ini)
    ) {
      prismaData.fecha_ini = new Date(prismaData.fecha_ini + 'T00:00:00.000Z')
    }

    if (prismaData.nota_fabrica === '' || prismaData.nota_fabrica === null) {
      delete prismaData.nota_fabrica
    }

    return await this.repository.create(prismaData)
  }

  /**
   * Updates an existing construction project.
   */
  async update(id: number, data: ObraUpdateInputExtended): Promise<obra> {
    const {
      cuil,
      cuil_cliente,
      cuil_arquitecto,
      cod_localidad,
      ...rest
    } = data

    await this.findById(id) // Ensure existence

    const prismaData: Prisma.obraUpdateInput = {
      ...rest,
    }

    const cuilCliente = cuil || cuil_cliente
    if (cuilCliente) {
      prismaData.cliente = { connect: { cuil: cuilCliente } }
    }

    if (typeof cuil_arquitecto !== 'undefined') {
      prismaData.arquitecto = cuil_arquitecto
        ? { connect: { cuil: cuil_arquitecto } }
        : { disconnect: true }
    }

    if (typeof cod_localidad !== 'undefined') {
      const codLocalidadNumber = Number(cod_localidad)
      if (Number.isFinite(codLocalidadNumber)) {
        prismaData.localidad = {
          connect: { cod_localidad: codLocalidadNumber },
        }
      }
    }

    if (
      typeof prismaData.fecha_ini === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(prismaData.fecha_ini)
    ) {
      prismaData.fecha_ini = new Date(prismaData.fecha_ini + 'T00:00:00.000Z')
    }

    return await this.repository.update(id, prismaData)
  }

  /**
   * Performs a logical deletion by changing status to CANCELADA.
   */
  async bajaLogica(id: number): Promise<obra> {
    await this.findById(id)
    const result = (await this.repository.bajaLogica(id)) as obra
    eventBus.emit('obra.cambio_estado', { cod_obra: id, nuevo_estado: 'CANCELADA' })
    return result
  }

  /**
   * Deletes a construction project from the database.
   */
  async remove(id: number): Promise<obra> {
    await this.findById(id)
    return (await this.repository.delete(id)) as obra
  }

  /**
   * Gets obras with accepted budgets and calculates financial status.
   */
  async findObrasConPresupuestoAceptado(search?: string) {
    const obrasConPresupuesto =
      await this.repository.findObrasConPresupuestoAceptado(search)

    return obrasConPresupuesto.map(obra => {
      const presupuestoAceptado = obra.presupuesto[0]
      const totalPagado = obra.pago.reduce((sum, pago) => sum + pago.monto, 0)
      const saldoPendiente = presupuestoAceptado.valor - totalPagado
      const porcentajePagado =
        presupuestoAceptado.valor > 0
          ? Math.round((totalPagado / presupuestoAceptado.valor) * 100)
          : 0

      return {
        cod_obra: obra.cod_obra,
        direccion: obra.direccion,
        estado: obra.estado,
        cliente: {
          cuil: this.formatCUIL(obra.cliente.cuil),
          nombre: obra.cliente.nombre,
          apellido: obra.cliente.apellido,
          razon_social: obra.cliente.razon_social,
        },
        presupuesto: {
          nro_presupuesto: presupuestoAceptado.nro_presupuesto,
          valor: presupuestoAceptado.valor,
          fecha_aceptacion: presupuestoAceptado.fecha_aceptacion
            ?.toISOString()
            .split('T')[0],
        },
        totalPagado,
        saldoPendiente,
        porcentajePagado,
        cantidad_pagos: obra.pago.length,
      }
    })
  }

  /**
   * Gets obras eligible for delivery creation based on whether it is partial or final.
   */
  async findObrasParaEntrega(search: string | undefined, esFinal: boolean): Promise<obra[]> {
    return this.repository.findObrasParaEntrega(search, esFinal)
  }

  /**
   * Gets company construction projects for stock ordering.
   */
  async findObrasParaPedidoStock(): Promise<obra[]> {
    return this.repository.findObrasParaPedidoStock()
  }

  /**
   * Changes obra status to EN ESPERA DE STOCK.
   */
  async solicitarStock(id: number): Promise<obra> {
    const obra = await this.findById(id)
    if (obra.estado !== 'PAGADA PARCIALMENTE') {
      throw new ValidationError(
        'Solo se puede solicitar stock para obras con pago parcial.',
        'INVALID_STATE'
      )
    }
    const updated = await this.repository.update(id, { estado: 'EN ESPERA DE STOCK' })
    eventBus.emit('obra.cambio_estado', { cod_obra: id, nuevo_estado: updated.estado })
    return updated
  }

  /**
   * Changes obra status to EN PRODUCCION manually by Production worker.
   */
  async iniciarProduccion(id: number): Promise<obra> {
    const obra = await this.findById(id)
    if (obra.estado !== 'PAGADA PARCIALMENTE') {
      throw new ValidationError('Esta obra no está lista para iniciar producción (Debe estar pagada parcialmente y tener stock).', 'INVALID_STATE')
    }
    const updated = await this.repository.update(id, { estado: 'EN PRODUCCION' })
    eventBus.emit('obra.cambio_estado', { cod_obra: id, nuevo_estado: updated.estado })
    return updated
  }

  /**
   * Formats CUIL with hyphens (e.g., 20-12345678-9).
   */
  /**
   * Obtiene la deuda total sumando presupuestos descontando pagos.
   */
  async getCuentasPorCobrar(): Promise<number> {
    const obrasPendientes = await prisma.obra.findMany({
      where: {
        estado: {
          in: [
            'PAGADA PARCIALMENTE',
            'EN ESPERA DE PAGO',
            'EN ESPERA DE STOCK',
            'EN PRODUCCION',
            'PRODUCCION FINALIZADA'
          ]
        },
      },
      include: {
        presupuesto: {
          where: { fecha_aceptacion: { not: null } },
        },
        pago: true,
      },
    })

    let cuentasPorCobrar = 0
    for (const ob of obrasPendientes) {
      const presupuestoAceptado = ob.presupuesto[ob.presupuesto.length - 1]
      if (presupuestoAceptado) {
        const totalPagado = ob.pago.reduce(
          (sum: number, pago: { monto: number }) => sum + Number(pago.monto),
          0,
        )
        const deuda = Number(presupuestoAceptado.valor) - totalPagado
        if (deuda > 0) cuentasPorCobrar += deuda
      }
    }
    return cuentasPorCobrar
  }

  /**
   * Obtiene estadísticas de obras para el dashboard de Administrador.
   */
  async getAdminStats(): Promise<{ obrasActivas: number; nuevasObrasDelMes: number; cuentasPorCobrar: number }> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const obrasActivas = await prisma.obra.count({
      where: { estado: { notIn: ['ENTREGADA', 'CANCELADA'] } },
    })

    const nuevasObrasDelMes = await prisma.obra.count({
      where: {
        fecha_ini: { gte: startOfMonth, lte: endOfMonth },
      },
    })

    const cuentasPorCobrar = await this.getCuentasPorCobrar()

    return { obrasActivas, nuevasObrasDelMes, cuentasPorCobrar }
  }

  /**
   * Obtiene estadísticas de obras para el dashboard de Ventas.
   */
  async getVentasStats(): Promise<{ totalPorCobrar: number; obrasGanadasMes: number; obrasFaltaStock: number }> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const totalPorCobrar = await this.getCuentasPorCobrar()

    const obrasGanadasMes = await prisma.obra.count({
      where: {
        fecha_ini: { gte: startOfMonth, lte: endOfMonth },
      },
    })

    const obrasFaltaStock = await prisma.obra.count({
      where: { estado: 'EN ESPERA DE STOCK' },
    })

    return { totalPorCobrar, obrasGanadasMes, obrasFaltaStock }
  }

  /**
   * Obtiene estadísticas de obras para el dashboard de Coordinación.
   */
  async getCoordinacionStats(): Promise<{ listasParaEntregar: number }> {
    const listasParaEntregar = await prisma.obra.count({
      where: { estado: 'PRODUCCION FINALIZADA' },
    })
    return { listasParaEntregar }
  }

  /**
   * Formats CUIL with hyphens (e.g., 20-12345678-9).
   */
  private formatCUIL(cuil: string): string {
    if (cuil.length === 11) {
      return `${cuil.slice(0, 2)}-${cuil.slice(2, 10)}-${cuil.slice(10)}`
    }
    return cuil
  }

  /**
   * Finalizes production of an obra by changing its status to PRODUCCION FINALIZADA.
   */
  async finalizarProduccion(id: number): Promise<obra> {
    const obra = await this.findById(id)
    if (obra.estado !== 'EN PRODUCCION') {
      throw new ValidationError(
        'Solo se pueden finalizar obras que están "En Producción".',
        'INVALID_STATE'
      )
    }
    const updated = await this.repository.update(id, { estado: 'PRODUCCION FINALIZADA' })
    eventBus.emit('obra.cambio_estado', { cod_obra: id, nuevo_estado: updated.estado })
    return updated
  }
}



