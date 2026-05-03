import { Prisma, maquinaria } from '@prisma/client'
import { MaquinariaRepository } from './maquinaria.repository.js'
import { ValidationError } from '../../shared/errors/validationError.js'
import { AppError } from '../../shared/errors/AppError.js'

export type AvailabilityStatus = 'DISPONIBLE' | 'ADVERTENCIA' | 'NO_DISPONIBLE'

export type MaquinariaConDisponibilidad = maquinaria & {
  availabilityStatus: AvailabilityStatus
  warningMessage?: string
}

/**
 * Servicio para manejar operaciones CRUD de maquinaria.
 */
export class MaquinariaService {
  private repository: MaquinariaRepository

  constructor() {
    this.repository = new MaquinariaRepository()
  }

  async findDisponibilidadPorFecha(
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<MaquinariaConDisponibilidad[]> {
    const buffer = 24 * 60 * 60 * 1000
    const warningStartTime = new Date(fechaInicio.getTime() - buffer)
    const warningEndTime = new Date(fechaFin.getTime() + buffer)

    const maquinariasConUsosCercanos =
      await this.repository.findAllWithUsageInRange(
        warningStartTime,
        warningEndTime,
      )

    return maquinariasConUsosCercanos.map(maquina => {
      let availabilityStatus: AvailabilityStatus = 'DISPONIBLE'
      let warningMessage: string | undefined = undefined

      if (maquina.uso_maquinaria.length > 0) {
        const hayConflictoDirecto = maquina.uso_maquinaria.some(
          uso =>
            new Date(uso.fecha_hora_ini_uso) < fechaFin &&
            new Date(uso.fecha_hora_fin_est) > fechaInicio,
        )

        if (hayConflictoDirecto) {
          availabilityStatus = 'NO_DISPONIBLE'
        } else {
          availabilityStatus = 'ADVERTENCIA'
          warningMessage =
            'Esta maquinaria tiene un uso programado dentro de las 24hs de la fecha seleccionada.'
        }
      }

      return {
        ...maquina,
        availabilityStatus,
        warningMessage,
      }
    })
  }

  async verificarDisponibilidadMaquinarias(
    maquinariaIds: number[],
    fechaInicio: Date,
    fechaFin: Date,
    excludeCodEntrega?: number,
  ): Promise<void> {
    if (maquinariaIds.length === 0) {
      return
    }
 
    const conflictos = await this.repository.findConflictingUsageForIds(
      maquinariaIds,
      fechaInicio,
      fechaFin,
      excludeCodEntrega,
    )

    if (conflictos.length > 0) {
      const maquinasEnConflicto = conflictos
        .map(c => `'${c.maquinaria.descripcion}' (ID: ${c.cod_maquina})`)
        .join(', ')
      throw new ValidationError(
        `Conflicto de horario. Las siguientes maquinarias ya están en uso en la fecha seleccionada: ${maquinasEnConflicto}`,
        'CONFLICTO_MAQUINARIA'
      )
    }
  }

  async create(data: Prisma.maquinariaCreateInput): Promise<maquinaria> {
    const maquinariaData = {
      ...data,
      estado: data.estado || 'DISPONIBLE',
    }
    return await this.repository.create(maquinariaData)
  }

  async findAll(filters?: {
    search?: string
    estado?: string
  }): Promise<maquinaria[]> {
    return await this.repository.findAll(filters)
  }

  async findById(cod_maquina: number): Promise<maquinaria> {
    const maquina = await this.repository.findById(cod_maquina)
    if (!maquina) {
      throw new AppError('No existe una maquinaria con el código proporcionado.', 404, 'MAQUINARIA_NOT_FOUND')
    }
    return maquina
  }

  async findDisponibles(): Promise<maquinaria[]> {
    return await this.repository.findByEstado('DISPONIBLE')
  }

  async update(
    cod_maquina: number,
    data: Prisma.maquinariaUpdateInput,
  ): Promise<maquinaria> {
    await this.findById(cod_maquina) // Throws if not found
    return await this.repository.update(cod_maquina, data)
  }

  async updateEstado(cod_maquina: number, estado: string): Promise<maquinaria> {
    await this.findById(cod_maquina) // Throws if not found

    const estadosValidos = ['DISPONIBLE', 'NO DISPONIBLE']
    if (!estadosValidos.includes(estado)) {
      throw new AppError(
        'Estado no válido. Estados permitidos: ' + estadosValidos.join(', '),
        400,
        'INVALID_STATUS'
      )
    }

    return await this.repository.update(cod_maquina, { estado })
  }

  async remove(cod_maquina: number): Promise<maquinaria> {
    const maquina = await this.findById(cod_maquina) // Throws if not found
    
    if (maquina.estado !== 'NO DISPONIBLE') {
      throw new AppError(
        'La maquinaria solo puede ser eliminada si se encuentra en estado "NO DISPONIBLE".',
        400,
        'INVALID_STATE'
      )
    }

    return await this.repository.update(cod_maquina, { estado: 'ELIMINADO' })
  }
  async getUsosProgramados(cod_maquina: number) {
    await this.findById(cod_maquina)
    return await this.repository.findUsosProgramados(cod_maquina)
  }
}

