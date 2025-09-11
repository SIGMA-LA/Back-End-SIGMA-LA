import { parametro, Prisma } from '@prisma/client'
import { ParametroRepository } from './parametro.repository'

/**
 * Servicio para manejar operaciones CRUD de parámetros.
 * @class ParametroService
 * @method create - Crea un nuevo parámetro.
 * @method findAll - Obtiene todos los parámetros.
 * @method findById - Obtiene un parámetro por su clave primaria compuesta (fecha_cambio y hora_cambio).
 * @method update - Actualiza un parámetro existente.
 * @method remove - Elimina un parámetro por su clave primaria compuesta (fecha_cambio y hora_cambio).
 * @returns {Promise<parametro | parametro[] | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class ParametroService {
  private repository: ParametroRepository

  constructor() {
    this.repository = new ParametroRepository()
  }

  /**
   * Crea un nuevo registro de parámetro.
   * @param data Los datos para el nuevo parámetro.
   * @returns El parámetro creado.
   */
  async create(data: Prisma.parametroCreateInput): Promise<parametro> {
    try {
      const existingParametro = await this.repository.findByFecha(
        data.fecha_cambio as Date,
        data.hora_cambio as Date,
      )
      if (existingParametro) {
        throw new Error(
          'Ya existe un parámetro con la misma fecha y hora de cambio.',
        )
      }

      return await this.repository.create(data)
    } catch (error) {
      throw new Error(`Error al crear el parámetro: ${error}`)
    }
  }

  /**
   * Obtiene todos los registros de parámetros.
   * @returns Una lista de todos los parámetros.
   */
  async findAll(): Promise<parametro[]> {
    try {
      return await this.repository.findAll()
    } catch (error) {
      throw new Error(`Error al obtener parametros: ${error}`)
    }
  }

  /**
   * Busca un parámetro específico por su clave primaria compuesta (fecha_cambio y hora_cambio).
   * @param fecha_cambio La fecha del cambio.
   * @param hora_cambio La hora del cambio.
   * @returns El parámetro encontrado o null si no existe.
   */
  async findById(
    fecha_cambio: Date,
    hora_cambio: Date,
  ): Promise<parametro | null> {
    try {
      return await this.repository.findByFecha(fecha_cambio, hora_cambio)
    } catch (error) {
      throw new Error(`Error al obtener parametros: ${error}`)
    }
  }

  /**
   * Actualiza un registro de parámetro existente.
   * @param fecha_cambio La fecha del cambio del parámetro a actualizar.
   * @param hora_cambio La hora del cambio del parámetro a actualizar.
   * @param data Los nuevos datos para el parámetro.
   * @returns El parámetro actualizado.
   */
  async update(
    fecha_cambio: Date,
    hora_cambio: Date,
    data: Prisma.parametroUpdateInput,
  ): Promise<parametro> {
    try {
      const existingParametro = await this.repository.findByFecha(
        fecha_cambio,
        hora_cambio,
      )
      if (!existingParametro) {
        throw new Error('Parametro no encontrado.')
      }

      return await this.repository.update(fecha_cambio, hora_cambio, data)
    } catch (error) {
      throw new Error(`Error al actualizar parametro: ${error}`)
    }
  }

  /**
   * Elimina un registro de parámetro.
   * @param fecha_cambio La fecha del cambio del parámetro a eliminar.
   * @param hora_cambio La hora del cambio del parámetro a eliminar.
   * @returns El parámetro eliminado.
   */
  async remove(fecha_cambio: Date, hora_cambio: Date): Promise<parametro> {
    try {
      const existingParametro = await this.repository.findByFecha(
        fecha_cambio,
        hora_cambio,
      )
      if (!existingParametro) {
        throw new Error('Empleado no encontrado')
      }

      return await this.repository.delete(fecha_cambio, hora_cambio)
    } catch (error) {
      throw new Error(`Error al eliminar parametro: ${error}`)
    }
  }
}
