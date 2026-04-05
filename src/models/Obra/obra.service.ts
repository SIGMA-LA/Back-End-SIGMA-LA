import { obra, Prisma } from '@prisma/client'
import {
  NotasFabricaFilters,
  ObraRepository,
} from './obra.repository.js'
import { AppError } from '../../shared/errors/AppError.js'
import { ValidationError } from '../../shared/errors/validationError.js'
import { prisma } from '../../shared/db/prismaClient.js'

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
  async filtrar(filtros: { estado?: string; cod_localidad?: number }): Promise<obra[]> {
    return this.repository.filtrar(filtros)
  }

  /**
   * Searches obras by text (address, client, etc.).
   */
  async buscar(q: string): Promise<obra[]> {
    if (!q) return this.findAll()
    return this.repository.buscar(q)
  }

  /**
   * Gets obras for a specific client.
   */
  async findByCliente(cuil_cliente: string): Promise<obra[]> {
    return this.repository.findByCliente(cuil_cliente)
  }

  /**
   * Gets all obras.
   */
  async findAll(): Promise<obra[]> {
    return this.repository.findAll()
  }

  /**
   * Gets an obra by its ID.
   */
  async findById(id: number): Promise<obra> {
    const entry = await this.repository.findById(id)
    if (!entry) {
      throw new AppError('Obra not found', 404, 'OBRA_NOT_FOUND')
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

    // Handle budgeting data from multiple potential keys and cast dates
    let parsedPresupuestosCreate = undefined
    if (presupuestos && Array.isArray(presupuestos)) {
      parsedPresupuestosCreate = presupuestos.map(
        (p: {
          valor: number
          fecha_emision?: string | Date
          fecha_aceptacion?: string | Date
        }) => ({
          valor: p.valor,
          fecha_emision: p.fecha_emision
            ? new Date(p.fecha_emision + 'T00:00:00.000Z')
            : new Date(),
          fecha_aceptacion: p.fecha_aceptacion
            ? new Date(p.fecha_aceptacion + 'T00:00:00.000Z')
            : null,
        }),
      )
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
    return (await this.repository.bajaLogica(id)) as obra
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
        'Stock can only be requested for projects with partial payment.',
        'INVALID_STATE'
      )
    }
    return await this.repository.update(id, { estado: 'EN ESPERA DE STOCK' })
  }

  /**
   * Changes obra status to EN PRODUCCION.
   */
  async recibirStock(id: number): Promise<obra> {
    const obra = await this.findById(id)
    if (obra.estado !== 'EN ESPERA DE STOCK') {
      throw new ValidationError('This project is not waiting for stock.', 'INVALID_STATE')
    }
    return await this.repository.update(id, { estado: 'EN PRODUCCION' })
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
}

