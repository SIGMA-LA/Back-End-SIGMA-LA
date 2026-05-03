import { VehiculoRepository } from './vehiculo.repository.js'
import {
  vehiculo,
  uso_vehiculo_entrega,
  uso_vehiculo_visita,
} from '@prisma/client'
import { ValidationError } from '../../shared/errors/validationError.js'
import { AppError } from '../../shared/errors/AppError.js'

export type AvailabilityStatus = 'DISPONIBLE' | 'ADVERTENCIA' | 'NO_DISPONIBLE'

export type VehiculoConDisponibilidad = vehiculo & {
  availabilityStatus: AvailabilityStatus
  warningMessage?: string
}

/**
 * Servicio para manejar la lógica de negocio de vehiculos.
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
      throw new AppError('Ya existe un vehiculo con esa patente', 409, 'DUPLICATE_PATENTE')
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

      const allUsages: (uso_vehiculo_entrega | uso_vehiculo_visita)[] = [
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
    excludeCodEntrega?: number,
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
        excludeCodEntrega,
      )

    if (conflictos.length > 0) {
      const vehiculosEnConflicto = conflictos
        .map(v => `'${v.patente}'`)
        .join(', ')
      throw new ValidationError(
        `Conflicto de horario. Los siguientes vehículos ya están en uso en la fecha seleccionada: ${vehiculosEnConflicto}`,
        'CONFLICTO_VEHICULOS',
      )
    }
  }

  // Obtener vehiculo por patente
  async findByPatente(patente: string): Promise<vehiculo> {
    const vehiculo = await this.vehiculoRepository.findByPatente(patente)
    if (!vehiculo) {
      throw new AppError('Vehiculo no encontrado', 404, 'VEHICULO_NOT_FOUND')
    }
    return vehiculo
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
    await this.findByPatente(patente) // Throws if not found
    return await this.vehiculoRepository.update(patente, data)
  }

  // Eliminar vehiculo
  async remove(patente: string): Promise<vehiculo> {
    const vehiculoInfo = await this.findByPatente(patente) // Throws if not found

    if (vehiculoInfo.estado !== 'FUERA DE SERVICIO') {
      throw new AppError(
        'El vehículo solo puede ser eliminado si se encuentra en estado "FUERA DE SERVICIO".',
        400,
        'INVALID_STATE'
      )
    }

    return await this.vehiculoRepository.update(patente, { estado: 'ELIMINADO' })
  }
  // Obtener usos programados
  async getUsosProgramados(patente: string) {
    await this.findByPatente(patente)
    return await this.vehiculoRepository.findUsosProgramados(patente)
  }
}

export const vehiculoService = new VehiculoService()

