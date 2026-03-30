import { presupuesto, Prisma } from '@prisma/client'
import { PresupuestoRepository } from './presupuesto.repository.js'

/**
 * Servicio para manejar operaciones CRUD de presupuesto.
 * @class PresupuestoService
 * @method create - Crea un nuevo presupuesto.
 * @method findAll - Obtiene todos los presupuesto.
 * @method findById - Obtiene un presupuesto por su clave primaria compuesta.
 * @method update - Actualiza un presupuesto existente.
 * @method remove - Elimina un presupuesto por su clave primaria compuesta.
 * @returns {Promise<presupuesto | presupuesto[] | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class PresupuestoService {
  private repository: PresupuestoRepository

  constructor() {
    this.repository = new PresupuestoRepository()
  }

  /**
   * Crea un nuevo registro de presupuesto.
   * @param data Los datos para el nuevo presupuesto.
   * @returns El presupuesto creado.
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
   * Obtiene todos los registros de presupuestos.
   * @returns Una lista de todos los presupuestos.
   */
  async findAll(): Promise<presupuesto[]> {
    return await this.repository.findAll()
  }

  /**
   * Busca un presupuesto específico por su clave primaria compuesta.
   * @param fecha_emision La fecha de emision.
   * @param cod_obra codigo de obra.
   * @returns El presupuesto encontrado o null si no existe.
   */
  async findById(nro_presupuesto: number): Promise<presupuesto | null> {
    return await this.repository.findById(nro_presupuesto)
  }

  /**
   * Actualiza un registro de presupuesto existente.
   * @param fecha_emision La fecha del emision del presupuesto a actualizar.
   * @param cod_obra codigo de obra del presupuesto a actualizar.
   * @param data Los nuevos datos para el presupuesto.
   * @returns El presupuesto actualizado.
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
    const existingpresupuesto = await this.repository.findById(nro_presupuesto)
    if (!existingpresupuesto) {
      throw new Error('presupuesto no encontrado.')
    }
    return await this.repository.update(nro_presupuesto, data)
  }

  /**
   * Elimina un registro de presupuesto.
   * @param fecha_emision La fecha de emision del presupuesto a eliminat.
   * @param cod_obra codigo de obra del presupuesto a eliminar.
   * @returns El presupuesto eliminado.
   */
  async remove(nro_presupuesto: number): Promise<presupuesto> {
    const existingpresupuesto = await this.repository.findById(nro_presupuesto)
    if (!existingpresupuesto) {
      throw new Error('Presupuesto no encontrado')
    }
    return await this.repository.delete(nro_presupuesto)
  }
}
