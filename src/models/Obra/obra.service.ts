import { obra, Prisma } from '@prisma/client'
import { ObraRepository } from './obra.repository.js'

/**
 * Servicio para gestionar las operaciones relacionadas con las obras.
 * @class ObraService
 * @method create - Crea una nueva obra.
 * @method findAll - Obtiene todas las obras.
 * @method findById - Obtiene una obra por su código.
 * @method update - Actualiza una obra existente.
 * @method remove - Elimina una obra por su código.
 * @returns {Promise<obra | obra[]>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class ObraService {
  private repository: ObraRepository

  constructor() {
    this.repository = new ObraRepository()
  }
  async buscar(q: string) {
    return this.repository.buscar(q)
  }
  async filtrar(filtros: { estado?: string; cod_localidad?: number }) {
    return this.repository.filtrar(filtros)
  }

  async create(data: Prisma.obraCreateInput): Promise<obra> {
    if (
      typeof data.fecha_ini === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_ini)
    ) {
      data.fecha_ini = new Date(data.fecha_ini + 'T00:00:00.000Z')
    }

    if (data.nota_fabrica === '' || data.nota_fabrica === null) {
      delete data.nota_fabrica
    }
    return await this.repository.create(data)
  }

  async findAll() {
    return this.repository.findAll()
  }

  async findById(id: number): Promise<obra | null> {
    return await this.repository.findById(id)
  }

  async subirNotaFabrica(id: number, file: Express.Multer.File): Promise<void> {
    await this.repository.subirNotaFabrica(id, file.path, file.filename)
  }

  async deleteNotaFabrica(id: number) {
    await this.repository.update(id, {
      nota_fabrica: null,
      nota_fabrica_pid: null,
    })
  }

  async update(id: number, data: Prisma.obraUpdateInput): Promise<obra> {
    if (
      typeof data.fecha_ini === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_ini)
    ) {
      data.fecha_ini = new Date(data.fecha_ini + 'T00:00:00.000Z')
    }

    return await this.repository.update(id, data)
  }

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

  async findNotasSinOrdenAprobada(): Promise<obra[]> {
    return await this.repository.findNotasSinOrdenAprobada()
  }

  async findNotasConOrdenEnProceso(): Promise<obra[]> {
    return await this.repository.findNotasConOrdenEnProceso()
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
