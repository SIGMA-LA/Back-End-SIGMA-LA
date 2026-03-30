import { localidad, Prisma } from '@prisma/client'
import { LocalidadRepository } from './localidad.repository.js'

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
  async findByProvincia(cod_provincia: number): Promise<localidad[]> {
    return await this.repository.findByProvincia(cod_provincia)
  }

  async create(data: Prisma.localidadCreateInput): Promise<localidad> {
    return await this.repository.create(data)
  }

  async findAll(): Promise<localidad[]> {
    return await this.repository.findAll()
  }

  async findById(cod_localidad: number): Promise<localidad | null> {
    return await this.repository.findById(cod_localidad)
  }

  async update(
    cod_localidad: number,
    data: Prisma.localidadUpdateInput,
  ): Promise<localidad> {
    const existingLocalidad = await this.repository.findById(cod_localidad)
    if (!existingLocalidad) {
      throw new Error(
        'No existe una localidad con el código postal proporcionado.',
      )
    }
    return await this.repository.update(cod_localidad, data)
  }

  async remove(cod_localidad: number): Promise<localidad> {
    const existingLocalidad = await this.repository.findById(cod_localidad)
    if (!existingLocalidad) {
      throw new Error(
        'No existe una localidad con el código postal proporcionado.',
      )
    }

    return await this.repository.delete(cod_localidad)
  }
}
