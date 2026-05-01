import { parametro, Prisma } from '@prisma/client'
import { ParametroRepository } from './parametro.repository.js'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Service to manage system parameters (parametro) operations.
 */
export class ParametroService {
  private repository: ParametroRepository

  constructor() {
    this.repository = new ParametroRepository()
  }

  /**
   * Creates a new parameter record.
   * @param data The parameter data.
   * @returns The created parameter.
   */
  async create(data: Prisma.parametroCreateInput): Promise<parametro> {
    // Handling fecha_cambio string input
    if (
      typeof data.fecha_cambio === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_cambio)
    ) {
      data.fecha_cambio = new Date(data.fecha_cambio + 'T00:00:00.000Z')
    }
    // Handling hora_cambio string input
    if (
      typeof data.hora_cambio === 'string' &&
      /^\d{2}:\d{2}:\d{2}$/.test(data.hora_cambio)
    ) {
      // Use a dummy date and the received time
      data.hora_cambio = new Date('1970-01-01T' + data.hora_cambio + '.000Z')
    }
    return await this.repository.create(data)
  }

  /**
   * Gets all parameter records.
   * @returns A list of all parameters.
   */
  async findAll(): Promise<parametro[]> {
    return await this.repository.findAll()
  }

  /**
   * Finds a parameter by its ID (cod_parametro).
   * @param id The parameter ID.
   * @returns The found parameter.
   */
  async findById(id: number): Promise<parametro> {
    const entry = await this.repository.findOne(id)
    if (!entry) {
      throw new AppError('Parámetro no encontrado', 404, 'PARAMETRO_NOT_FOUND')
    }
    return entry
  }

  /**
   * Finds the latest parameter record.
   * @returns The latest parameter.
   */
  async findLatest(): Promise<parametro> {
    const latest = await this.repository.findLatest()
    if (!latest) {
      throw new AppError('No parameters found', 404, 'PARAMETRO_NOT_FOUND')
    }
    return latest
  }

  /**
   * Finds the latest viatico (travel allowance) value.
   * @returns The latest viatico amount.
   */
  async findActualViatico(): Promise<{ viatico_dia_persona: number }> {
    const latest = await this.repository.findLatest()
    if (!latest) {
      return { viatico_dia_persona: 0 }
    }
    return { viatico_dia_persona: latest.viatico_dia_persona ?? 0 }
  }

  /**
   * Updates an existing parameter record.
   * @param id The parameter ID to update.
   * @param data The new data for the parameter.
   * @returns The updated parameter.
   */
  async update(
    id: number,
    data: Prisma.parametroUpdateInput,
  ): Promise<parametro> {
    await this.findById(id) // Ensure existence

    // Handling fecha_cambio string input if needed for update
    if (
      typeof data.fecha_cambio === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_cambio)
    ) {
      data.fecha_cambio = new Date(data.fecha_cambio + 'T00:00:00.000Z')
    }

    return await this.repository.update(id, data)
  }

  /**
   * Deletes a parameter record.
   * @param id The parameter ID to delete.
   * @returns The deleted parameter.
   */
  async remove(id: number): Promise<parametro> {
    await this.findById(id)
    return await this.repository.delete(id)
  }
}

