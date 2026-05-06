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
   * Converts a string to title case (first letter of each word capitalized).
   */
  private toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
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
    // Normalize the nombre_localidad to title case
    if (typeof data.nombre_localidad === 'string') {
      data.nombre_localidad = this.toTitleCase(data.nombre_localidad)
    }

    // Extract nombre and cod_provincia from the create input
    const nombre = typeof data.nombre_localidad === 'string' ? data.nombre_localidad : ''
    const codProvincia = (data.provincia as any)?.connect?.cod_provincia

    if (nombre && typeof codProvincia === 'number') {
      // Check for duplicate
      const existing = await this.repository.findByNombreAndProvincia(nombre, codProvincia)
      if (existing) {
        throw new AppError(
          `Ya existe una localidad con el nombre "${nombre}" en esta provincia`,
          400,
          'LOCALIDAD_DUPLICATE'
        )
      }
    }

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
    // Check if the location has related entities (obras or visitas)
    const hasRelated = await this.repository.hasRelatedEntities(cod_localidad)
    if (hasRelated) {
      throw new AppError(
        'No se puede eliminar la localidad porque tiene obras o visitas asociadas.',
        400,
        'LOCALIDAD_HAS_RELATIONS'
      )
    }

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

