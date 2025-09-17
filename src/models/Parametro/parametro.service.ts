import { parametro, Prisma } from '@prisma/client'
import { ParametroRepository } from './parametro.repository.js'

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
    return await this.repository.create(data)
  }

  /**
   * Obtiene todos los registros de parámetros.
   * @returns Una lista de todos los parámetros.
   */
  async findAll(): Promise<parametro[]> {
    return await this.repository.findAll()
  }

  /**
   * Busca un parámetro específico por su clave primaria compuesta (fecha_cambio y hora_cambio).
   * @param fecha_cambio La fecha del cambio.
   * @param hora_cambio La hora del cambio.
   * @returns El parámetro encontrado o null si no existe.
   */
  async findById(id: number): Promise<parametro | null> {
    return await this.repository.findOne(id)
  }

  /**
   * Actualiza un registro de parámetro existente.
   * @param fecha_cambio La fecha del cambio del parámetro a actualizar.
   * @param hora_cambio La hora del cambio del parámetro a actualizar.
   * @param data Los nuevos datos para el parámetro.
   * @returns El parámetro actualizado.
   */
  async update(
    id: number,
    data: Prisma.parametroUpdateInput,
  ): Promise<parametro> {
    const existingParametro = await this.repository.findOne(id)
    if (!existingParametro) {
      throw new Error('Parametro no encontrado.')
    }

    return await this.repository.update(id, data)
  }

  /**
   * Elimina un registro de parámetro.
   * @param fecha_cambio La fecha del cambio del parámetro a eliminar.
   * @param hora_cambio La hora del cambio del parámetro a eliminar.
   * @returns El parámetro eliminado.
   */
  async remove(id: number): Promise<parametro> {
    const existingParametro = await this.repository.findOne(id)
    if (!existingParametro) {
      throw new Error('Parametro no encontrado.')
    }

    return await this.repository.delete(id)
  }
}
