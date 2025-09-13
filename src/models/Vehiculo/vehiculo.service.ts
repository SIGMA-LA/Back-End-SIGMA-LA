import { VehiculoRepository } from './vehiculo.repository.js'
import { vehiculo } from '@prisma/client'

/**
 * Servicio para manejar la lógica de negocio de vehiculos.
 * @class VehiculoService
 * @method create - Crea un nuevo vehiculo validando que la patente no exista.
 * @method findAll - Obtiene todos los vehiculos.
 * @method findByPatente - Obtiene un vehiculo por su patente.
 * @method update - Actualiza un vehiculo existente verificando que existe.
 * @method remove - Elimina un vehiculo por su patente verificando que existe.
 * @method count - Cuenta el total de vehiculos registrados.
 * @returns {Promise<vehiculo | vehiculo[] | number | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class VehiculoService {
  private vehiculoRepository: VehiculoRepository

  constructor() {
    this.vehiculoRepository = new VehiculoRepository()
  }

  // Crear nuevo vehiculo
  async create(data: {
    patente: string
    tipo_vehiculo: string
    estado: string
  }): Promise<vehiculo> {
    try {
      const existingVehiculo = await this.vehiculoRepository.findByPatente(
        data.patente,
      )
      if (existingVehiculo) {
        throw new Error('Ya existe un vehiculo con esa patente')
      }

      return await this.vehiculoRepository.create(data)
    } catch (error: unknown) {
      throw new Error(
        `Error al crear vehiculo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    }
  }

  // Obtener todos los vehiculos
  async findAll(): Promise<vehiculo[]> {
    try {
      return await this.vehiculoRepository.findAll()
    } catch (error: unknown) {
      throw new Error(
        `Error al obtener vehiculos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    }
  }

  // Obtener vehiculo por patente
  async findByPatente(patente: string): Promise<vehiculo | null> {
    try {
      return await this.vehiculoRepository.findByPatente(patente)
    } catch (error: unknown) {
      throw new Error(
        `Error al buscar vehiculo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    }
  }

  // Actualizar vehiculo
  async update(
    patente: string,
    data: {
      tipo_vehiculo?: string
      estado?: string
    },
  ): Promise<vehiculo> {
    try {
      const existingVehiculo =
        await this.vehiculoRepository.findByPatente(patente)
      if (!existingVehiculo) {
        throw new Error('Vehiculo no encontrado')
      }

      return await this.vehiculoRepository.update(patente, data)
    } catch (error: unknown) {
      throw new Error(
        `Error al actualizar vehiculo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    }
  }

  // Eliminar vehiculo
  async remove(patente: string): Promise<vehiculo> {
    try {
      const existingVehiculo =
        await this.vehiculoRepository.findByPatente(patente)
      if (!existingVehiculo) {
        throw new Error('Vehiculo no encontrado')
      }

      return await this.vehiculoRepository.remove(patente)
    } catch (error: unknown) {
      throw new Error(
        `Error al eliminar vehiculo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    }
  }
}

export const vehiculoService = new VehiculoService()
