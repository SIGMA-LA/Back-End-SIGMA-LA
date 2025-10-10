import { obra, Prisma } from '@prisma/client'
import { ObraRepository } from './obra.repository.js'

type ObraCreateInputExtended = Prisma.obraCreateInput & {
  cuil?: string
  cod_localidad?: number
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

  /** Crea una nueva obra */
  async create(data: ObraCreateInputExtended): Promise<obra> {
    const { cuil, cod_localidad, ...rest } = data

    const prismaData: Prisma.obraCreateInput = {
      ...rest,
      ...(cuil && { cliente: { connect: { cuil } } }),
      ...(cod_localidad && {
        localidad: { connect: { cod_localidad: Number(cod_localidad) } },
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
  async update(id: number, data: Prisma.obraUpdateInput): Promise<obra> {
    if (
      typeof data.fecha_ini === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_ini)
    ) {
      data.fecha_ini = new Date(data.fecha_ini + 'T00:00:00.000Z')
    }

    return await this.repository.update(id, data)
  }

  /** Baja lógica de una obra (cambia estado a CANCELADA) */
  async bajaLogica(id: number) {
    return this.repository.bajaLogica(id)
  }

  /** Elimina una obra por ID (baja física) */
  async remove(id: number): Promise<obra> {
    const existingObra = await this.repository.findById(id)
    if (!existingObra) {
      throw new Error('No existe una obra con el código proporcionado.')
    }

    const dataToUpdate = {
      estado: 'CANCELADA',
      fecha_cancelacion: new Date(),
    }

    return await this.repository.update(id, dataToUpdate)
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
      }
    })
  }

  private formatCUIL(cuil: string): string {
    // Formatear CUIL con guiones: 20-12345678-9
    if (cuil.length === 11) {
      return `${cuil.slice(0, 2)}-${cuil.slice(2, 10)}-${cuil.slice(10)}`
    }
    return cuil
  }
}
