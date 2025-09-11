import { localidad, Prisma } from '@prisma/client'
import { LocalidadRepository } from './localidad.repository'

/**
 * Servicio para manejar operaciones CRUD de localidades.
 * @class LocalidadService
 * @method create - Crea una nueva localidad.
 * @method findAll - Obtiene todas las localidades.
 * @method findById - Obtiene una localidad por su código postal.
 * @method update - Actualiza una localidad existente.
 * @method remove - Elimina una localidad por su código postal.
 * @returns {Promise<localidad | localidad[] | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class LocalidadService {
  private repository: LocalidadRepository

  constructor() {
    this.repository = new LocalidadRepository()
  }

  async create(data: Prisma.localidadCreateInput): Promise<localidad> {
    try {
      const existingLocalidad = await this.repository.findById(
        data.cod_postal as number,
      )
      if (existingLocalidad) {
        throw new Error('Ya existe una localidad con el mismo código postal.')
      }
      return await this.repository.create(data)
    } catch (error) {
      throw new Error(`Error al crear la localidad: ${error}`)
    }
  }

  async findAll(): Promise<localidad[]> {
    return await this.repository.findAll()
  }

  async findById(cod_postal: number): Promise<localidad | null> {
    try {
      return await this.repository.findById(cod_postal)
    } catch (error) {
      throw new Error(`Error al obtener localidades: ${error}`)
    }
  }

  async update(
    cod_postal: number,
    data: Prisma.localidadUpdateInput,
  ): Promise<localidad> {
    try {
      const existingLocalidad = await this.repository.findById(cod_postal)
      if (!existingLocalidad) {
        throw new Error(
          'No existe una localidad con el código postal proporcionado.',
        )
      }
      return await this.repository.update(cod_postal, data)
    } catch (error) {
      throw new Error(`Error al actualizar la localidad: ${error}`)
    }
  }

  async remove(cod_postal: number): Promise<localidad> {
    try {
      const existingLocalidad = await this.repository.findById(cod_postal)
      if (!existingLocalidad) {
        throw new Error(
          'No existe una localidad con el código postal proporcionado.',
        )
      }

      return await this.repository.delete(cod_postal)
    } catch (error) {
      throw new Error(`Error al elimina la localidad: ${error}`)
    }
  }
}
