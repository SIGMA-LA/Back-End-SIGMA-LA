import { VehiculoRepository } from './vehiculo.repository.js'
import {
  vehiculo,
  uso_vehiculo_entrega,
  uso_vehiculo_visita,
} from '@prisma/client'

export type AvailabilityStatus = 'DISPONIBLE' | 'ADVERTENCIA' | 'NO_DISPONIBLE'

export type VehiculoConDisponibilidad = vehiculo & {
  availabilityStatus: AvailabilityStatus
  warningMessage?: string
}

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
    anio: number
    marca: string
    modelo: string
  }): Promise<vehiculo> {
    const existingVehiculo = await this.vehiculoRepository.findByPatente(
      data.patente,
    )
    if (existingVehiculo) {
      throw new Error('Ya existe un vehiculo con esa patente')
    }

    return await this.vehiculoRepository.create(data)
  }

  // Obtener todos los vehiculos
  async findAll(filters?: {
    search?: string
    estado?: string
  }): Promise<vehiculo[]> {
    return await this.vehiculoRepository.findAll(filters)
  }

  // Obtener todos los vehiculos disponibles
  async findDisponibles(): Promise<vehiculo[]> {
    return await this.vehiculoRepository.findByEstado('DISPONIBLE')
  }

  async findDisponibilidadPorFecha(
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<VehiculoConDisponibilidad[]> {
    const buffer = 24 * 60 * 60 * 1000 // Buffer de 24 horas
    const warningStartTime = new Date(fechaInicio.getTime() - buffer)
    const warningEndTime = new Date(fechaFin.getTime() + buffer)

    const vehiculosConUsos =
      await this.vehiculoRepository.findAllWithUsageInRange(
        warningStartTime,
        warningEndTime,
      )

    return vehiculosConUsos.map(vehiculo => {
      let availabilityStatus: AvailabilityStatus = 'DISPONIBLE'
      let warningMessage: string | undefined = undefined

      const allUsages = [
        ...(vehiculo.uso_vehiculo_entrega ?? []),
        ...(vehiculo.uso_vehiculo_visita ?? []),
      ]

      if (allUsages.length > 0) {
        const hayConflictoDirecto = allUsages.some(uso => {
          const fechaFinUso =
            'fecha_hora_fin_est' in uso
              ? (uso as uso_vehiculo_visita).fecha_hora_fin_est
              : (uso as uso_vehiculo_entrega).fecha_hora_ini_est

          return (
            new Date(uso.fecha_hora_ini_uso) < fechaFin &&
            new Date(fechaFinUso) > fechaInicio
          )
        })

        if (hayConflictoDirecto) {
          availabilityStatus = 'NO_DISPONIBLE'
        } else {
          availabilityStatus = 'ADVERTENCIA'
          warningMessage =
            'Este vehículo tiene un uso programado dentro de las 24hs de la fecha seleccionada.'
        }
      }

      return {
        ...vehiculo,
        availabilityStatus,
        warningMessage,
      }
    })
  }

  async verificarDisponibilidadVehiculos(
    patentes: string[],
    fechaInicio: Date,
    fechaFin: Date,
    excludeCodVisita?: number,
  ): Promise<void> {
    if (patentes.length === 0) {
      return
    }

    const conflictos =
      await this.vehiculoRepository.findConflictingUsageForPatentes(
        patentes,
        fechaInicio,
        fechaFin,
        excludeCodVisita,
      )

    if (conflictos.length > 0) {
      const vehiculosEnConflicto = conflictos
        .map(v => `'${v.patente}'`)
        .join(', ')
      throw new Error(
        `Conflicto de horario. Los siguientes vehículos ya están en uso en la fecha seleccionada: ${vehiculosEnConflicto}`,
      )
    }
  }

  // Obtener vehiculo por patente
  async findByPatente(patente: string): Promise<vehiculo | null> {
    return await this.vehiculoRepository.findByPatente(patente)
  }

  // Actualizar vehiculo
  async update(
    patente: string,
    data: {
      tipo_vehiculo?: string
      estado?: string
      anio?: number
      marca?: string
      modelo?: string
    },
  ): Promise<vehiculo> {
    const existingVehiculo =
      await this.vehiculoRepository.findByPatente(patente)
    if (!existingVehiculo) {
      throw new Error('Vehiculo no encontrado')
    }

    return await this.vehiculoRepository.update(patente, data)
  }

  // Eliminar vehiculo
  async remove(patente: string): Promise<vehiculo> {
    const existingVehiculo =
      await this.vehiculoRepository.findByPatente(patente)
    if (!existingVehiculo) {
      throw new Error('Vehiculo no encontrado')
    }

    return await this.vehiculoRepository.remove(patente)
  }
}

export const vehiculoService = new VehiculoService()
