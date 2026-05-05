import { localidad, Prisma } from '@prisma/client'
import { LocalidadRepository } from './localidad.repository.js'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Service to manage location (localidad) operations.
 */
export class LocalidadService {
  private repository: LocalidadRepository

  constructor() {
    this.repository = new LocalidadRepository()
  }

  /**
   * Gets all locations within a specific province.
   */
  async findByProvincia(cod_provincia: number): Promise<localidad[]> {
    return await this.repository.findByProvincia(cod_provincia)
  }

  /**
   * Creates a new location record.
   */
  async create(data: Prisma.localidadCreateInput): Promise<localidad> {
    return await this.repository.create(data)
  }

  /**
   * Gets all location records.
   */
  async findAll(): Promise<localidad[]> {
    return await this.repository.findAll()
  }

  /**
   * Finds a location by its ID (cod_localidad).
   */
  async findById(cod_localidad: number): Promise<localidad> {
    const entry = await this.repository.findById(cod_localidad)
    if (!entry) {
      throw new AppError('Location not found', 404, 'LOCALIDAD_NOT_FOUND')
    }
    return entry
  }

  /**
   * Updates an existing location record.
   */
  async update(
    cod_localidad: number,
    data: Prisma.localidadUpdateInput,
  ): Promise<localidad> {
    await this.findById(cod_localidad) // Ensure existence
    return await this.repository.update(cod_localidad, data)
  }

  /**
   * Searches locations by name.
   */
  async search(searchTerm: string): Promise<localidad[]> {
    return await this.repository.search(searchTerm)
  }

  /**
   * Deletes a location record.
   */
  async remove(cod_localidad: number): Promise<localidad> {
    try {
      return await this.repository.delete(cod_localidad)
    } catch (error: any) {
      // If the error is due to record not found, throw our custom error
      if (error.code === 'P2025') {
        throw new AppError('Location not found', 404, 'LOCALIDAD_NOT_FOUND')
      }
      // Re-throw other errors (like foreign key constraints)
      throw error
    }
  }
}

