import { obra, Prisma } from '@prisma/client'
import { ObraRepository } from './obra.repository.js'

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
 * Servicio para gestionar las operaciones relacionadas con las obras.
 */
export class ObraService {
  private repository: ObraRepository

  constructor() {
    this.repository = new ObraRepository()
  }

  // ----------- FILTROS Y BÚSQUEDAS -----------

  /** Filtra obras por estado, localidad o ambos */
  async filtrar(filtros: { estado?: string; cod_localidad?: number }) {
    return this.repository.filtrar(filtros)
  }

  /** Busca obras por texto (dirección, cliente, etc.) */
  async buscar(q: string) {
    return this.repository.buscar(q)
  }

  /** Obtiene obras de un cliente específico */
  async findByCliente(cuil_cliente: string) {
    return this.repository.findByCliente(cuil_cliente)
  }

  /** Obtiene todas las obras */
  async findAll(): Promise<obra[]> {
    return this.repository.findAll()
  }

  /** Obtiene una obra por ID */
  async findById(id: number): Promise<obra | null> {
    return await this.repository.findById(id)
  }

  // ----------- NOTA DE FÁBRICA -----------

  /** Sube nota de fábrica a una obra */
  async subirNotaFabrica(id: number, file: Express.Multer.File): Promise<void> {
    await this.repository.subirNotaFabrica(id, file.path, file.filename)
  }

  /** Elimina la nota de fábrica de una obra */
  async deleteNotaFabrica(id: number) {
    await this.repository.update(id, {
      nota_fabrica: null,
      nota_fabrica_pid: null,
    })
  }

  /** Obtiene obras con nota de fábrica sin orden aprobada */
  async findNotasSinOrdenAprobada(): Promise<obra[]> {
    return await this.repository.findNotasSinOrdenAprobada()
  }

  /** Obtiene obras con nota de fábrica y orden en proceso */
  async findNotasConOrdenEnProceso(): Promise<obra[]> {
    return await this.repository.findNotasConOrdenEnProceso()
  }

  // ----------- CRUD DE OBRAS -----------

  async create(data: ObraCreateInputExtended): Promise<obra> {
    const {
      cuil,
      cuil_cliente,
      cuil_arquitecto,
      cod_localidad,
      presupuestos,
      presupuesto,
      ...rest
    } = data

    // Procesar los datos de presupuestos desde ambas posibles key y castear las fechas a Date
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
    } else if (presupuesto?.create && Array.isArray(presupuesto.create)) {
      parsedPresupuestosCreate = presupuesto.create.map(
        (p: {
          nro_presupuesto?: number
          valor: number
          fecha_emision: string | Date
          fecha_aceptacion?: string | Date | null
          [key: string]: unknown
        }) => {
          const pRest = { ...p }
          delete pRest.nro_presupuesto
          if (
            typeof pRest.fecha_emision === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(pRest.fecha_emision)
          ) {
            pRest.fecha_emision = new Date(
              pRest.fecha_emision + 'T00:00:00.000Z',
            )
          }
          if (
            typeof pRest.fecha_aceptacion === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(pRest.fecha_aceptacion)
          ) {
            pRest.fecha_aceptacion = new Date(
              pRest.fecha_aceptacion + 'T00:00:00.000Z',
            )
          }
          return pRest
        },
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
  /** Actualiza una obra por ID */
  async update(id: number, data: ObraUpdateInputExtended): Promise<obra> {
    const {
      cuil,
      cuil_cliente,
      cuil_arquitecto,
      cod_localidad,
      ...rest
    } = data

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

  /** Baja lógica de una obra (cambia estado a CANCELADA) */
  async bajaLogica(id: number) {
    return this.repository.bajaLogica(id)
  }

  /** Elimina una obra por ID */
  async remove(id: number) {
    const existingObra = await this.repository.findById(id)
    if (!existingObra) {
      throw new Error('No existe una obra con el código proporcionado.')
    }
    return await this.repository.delete(id)
  }

  async findObrasConPresupuestoAceptado(search?: string) {
    const obrasConPresupuesto =
      await this.repository.findObrasConPresupuestoAceptado(search)

    return obrasConPresupuesto.map(obra => {
      const presupuestoAceptado = obra.presupuesto[0] // Ya filtrado en el query
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
            .split('T')[0], // Solo fecha YYYY-MM-DD
        },
        totalPagado,
        saldoPendiente,
        porcentajePagado,
        cantidad_pagos: obra.pago.length,
      }
    })
  }

  /** Obtiene obras de empresas para realizar pedido de stock */
  async findObrasParaPedidoStock() {
    return this.repository.findObrasParaPedidoStock()
  }

  /** Cambia el estado de una obra a EN ESPERA DE STOCK */
  async solicitarStock(id: number): Promise<obra> {
    const obra = await this.repository.findById(id)
    if (!obra) {
      throw new Error('Obra no encontrada.')
    }
    if (obra.estado !== 'PAGADA PARCIALMENTE') {
      throw new Error(
        'Solo se puede solicitar stock para obras con pago parcial.',
      )
    }
    return await this.repository.update(id, { estado: 'EN ESPERA DE STOCK' })
  }

  /** Cambia el estado de una obra a EN PRODUCCION */
  async recibirStock(id: number): Promise<obra> {
    const obra = await this.repository.findById(id)
    if (!obra) {
      throw new Error('Obra no encontrada.')
    }
    if (obra.estado !== 'EN ESPERA DE STOCK') {
      throw new Error('Esta obra no está esperando stock.')
    }
    return await this.repository.update(id, { estado: 'EN PRODUCCION' })
  }

  private formatCUIL(cuil: string): string {
    // Formatear CUIL con guiones: 20-12345678-9
    if (cuil.length === 11) {
      return `${cuil.slice(0, 2)}-${cuil.slice(2, 10)}-${cuil.slice(10)}`
    }
    return cuil
  }
}
