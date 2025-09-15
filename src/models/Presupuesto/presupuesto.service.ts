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
    const existingpresupuesto = await this.repository.findById(
      data.fecha_emision as Date,
      data.obra as number,
    )
    if (existingpresupuesto) {
      throw new Error(
        'Ya existe un presupuesto con la misma fecha y hora de cambio.',
      )
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
  async findById(
    fecha_emision: Date,
    cod_obra: number,
  ): Promise<presupuesto | null> {
    return await this.repository.findById(fecha_emision, cod_obra)
  }

  /**
   * Actualiza un registro de presupuesto existente.
   * @param fecha_emision La fecha del emision del presupuesto a actualizar.
   * @param cod_obra codigo de obra del presupuesto a actualizar.
   * @param data Los nuevos datos para el presupuesto.
   * @returns El presupuesto actualizado.
   */
  async update(
    fecha_emision: Date,
    cod_obra: number,
    data: Prisma.presupuestoUpdateInput,
  ): Promise<presupuesto> {
    const existingpresupuesto = await this.repository.findById(
      fecha_emision,
      cod_obra,
    )
    if (!existingpresupuesto) {
      throw new Error('presupuesto no encontrado.')
    }

    return await this.repository.update(fecha_emision, cod_obra, data)
  }

  /**
   * Elimina un registro de presupuesto.
   * @param fecha_emision La fecha de emision del presupuesto a eliminat.
   * @param cod_obra codigo de obra del presupuesto a eliminar.
   * @returns El presupuesto eliminado.
   */
  async remove(fecha_emision: Date, cod_obra: number): Promise<presupuesto> {
    const existingpresupuesto = await this.repository.findById(
      fecha_emision,
      cod_obra,
    )
    if (!existingpresupuesto) {
      throw new Error('Empleado no encontrado')
    }

    return await this.repository.delete(fecha_emision, cod_obra)
  }
}
