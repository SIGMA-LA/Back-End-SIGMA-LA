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
    // Ajuste para fecha_cambio
    if (
      typeof data.fecha_cambio === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_cambio)
    ) {
      data.fecha_cambio = new Date(data.fecha_cambio + 'T00:00:00.000Z')
    }
    // Ajuste para hora_cambio
    if (
      typeof data.hora_cambio === 'string' &&
      /^\d{2}:\d{2}:\d{2}$/.test(data.hora_cambio)
    ) {
      // Usar una fecha dummy y la hora recibida
      data.hora_cambio = new Date('1970-01-01T' + data.hora_cambio + '.000Z')
    }
    return await this.repository.create(data)
  }

  async findAll(): Promise<parametro[]> {
    return await this.repository.findAll()
  }

  async findById(id: number): Promise<parametro | null> {
    return await this.repository.findOne(id)
  }

  async findActualViatico(): Promise<{ viatico_dia_persona: number } | null> {
    const ultimoParametro = await this.repository.findLatest();
    if (!ultimoParametro) {
      return null;
    }
    return { viatico_dia_persona: ultimoParametro.viatico_dia_persona ?? 0 };
  }

  async update(
    id: number,
    data: Prisma.parametroUpdateInput,
  ): Promise<parametro> {
    const existingParametro = await this.repository.findOne(id)
    if (!existingParametro) {
      throw new Error('Parametro no encontrado.')
    }

    // Ajuste también para update si es necesario
    if (
      typeof data.fecha_cambio === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_cambio)
    ) {
      data.fecha_cambio = new Date(data.fecha_cambio + 'T00:00:00.000Z')
    }

    return await this.repository.update(id, data)
  }

  async remove(id: number): Promise<parametro> {
    const existingParametro = await this.repository.findOne(id)
    if (!existingParametro) {
      throw new Error('Parametro no encontrado.')
    }

    return await this.repository.delete(id)
  }
}
