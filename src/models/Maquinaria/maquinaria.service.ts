import { Prisma, maquinaria } from '@prisma/client'
import { MaquinariaRepository } from './maquinaria.repository.js'

export type AvailabilityStatus = 'DISPONIBLE' | 'ADVERTENCIA' | 'NO_DISPONIBLE'

export type MaquinariaConDisponibilidad = maquinaria & {
  availabilityStatus: AvailabilityStatus
  warningMessage?: string
}

/**
 * Servicio para manejar operaciones CRUD de maquinaria.
 * @class MaquinariaService
 * @method create - Crea una nueva maquinaria.
 * @method findAll - Obtiene todas las maquinarias.
 * @method findById - Obtiene una maquinaria por su código.
 * @method update - Actualiza una maquinaria existente.
 * @method remove - Elimina una maquinaria por su código.
 * @returns {Promise<maquinaria | maquinaria[] | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class MaquinariaService {
  private repository: MaquinariaRepository

  constructor() {
    this.repository = new MaquinariaRepository()
  }

  async findDisponibilidadPorFecha(fechaInicio: Date, fechaFin: Date): Promise<MaquinariaConDisponibilidad[]> {
    
    const buffer = 24 * 60 * 60 * 1000;
    const warningStartTime = new Date(fechaInicio.getTime() - buffer);
    const warningEndTime = new Date(fechaFin.getTime() + buffer);

    const maquinariasConUsosCercanos = await this.repository.findAllWithUsageInRange(warningStartTime, warningEndTime);

    return maquinariasConUsosCercanos.map(maquina => {
      let availabilityStatus: AvailabilityStatus = 'DISPONIBLE';
      let warningMessage: string | undefined = undefined;

      if (maquina.uso_maquinaria.length > 0) {
        const hayConflictoDirecto = maquina.uso_maquinaria.some(uso =>
          (new Date(uso.fecha_hora_ini_uso) < fechaFin) && (new Date(uso.fecha_hora_fin_est) > fechaInicio)
        );

        if (hayConflictoDirecto) {
          availabilityStatus = 'NO_DISPONIBLE';
        } else {
          availabilityStatus = 'ADVERTENCIA';
          warningMessage = 'Esta maquinaria tiene un uso programado dentro de las 24hs de la fecha seleccionada.';
        }
      }
      
      return {
        ...maquina,
        availabilityStatus,
        warningMessage,
      };
    });
  }

  async verificarDisponibilidadMaquinarias(maquinariaIds: number[], fechaInicio: Date, fechaFin: Date): Promise<void> {
    if (maquinariaIds.length === 0) {
      return;
    }

    const conflictos = await this.repository.findConflictingUsageForIds(maquinariaIds, fechaInicio, fechaFin);

    if (conflictos.length > 0) {
      const maquinasEnConflicto = conflictos.map(c => `'${c.maquinaria.descripcion}' (ID: ${c.cod_maquina})`).join(', ');
      throw new Error(`Conflicto de horario. Las siguientes maquinarias ya están en uso en la fecha seleccionada: ${maquinasEnConflicto}`);
    }
  }

  async create(data: Prisma.maquinariaCreateInput): Promise<maquinaria> {
    // Establecer estado por defecto si no se proporciona
    const maquinariaData = {
      ...data,
      estado: data.estado || 'DISPONIBLE',
    }
    return await this.repository.create(maquinariaData)
  }

  async findAll(): Promise<maquinaria[]> {
    return this.repository.findAll()
  }

  async findById(cod_maquina: number): Promise<maquinaria | null> {
    return await this.repository.findById(cod_maquina)
  }

  async findDisponibles(): Promise<maquinaria[]> {
    return await this.repository.findByEstado('DISPONIBLE')
  }

  async update(
    cod_maquina: number,
    data: Prisma.maquinariaUpdateInput,
  ): Promise<maquinaria> {
    const existingMaquinaria = await this.repository.findById(cod_maquina)
    if (!existingMaquinaria) {
      throw new Error('No existe una maquinaria con el código proporcionado.')
    }
    return await this.repository.update(cod_maquina, data)
  }

  async updateEstado(cod_maquina: number, estado: string): Promise<maquinaria> {
    const existingMaquinaria = await this.repository.findById(cod_maquina)
    if (!existingMaquinaria) {
      throw new Error('No existe una maquinaria con el código proporcionado.')
    }

    // Validar estados permitidos
    const estadosValidos = ['DISPONIBLE', 'NO DISPONIBLE']
    if (!estadosValidos.includes(estado)) {
      throw new Error(
        'Estado no válido. Estados permitidos: ' + estadosValidos.join(', '),
      )
    }

    return await this.repository.update(cod_maquina, { estado })
  }

  async remove(cod_maquina: number): Promise<maquinaria> {
    const existingMaquinaria = await this.repository.findById(cod_maquina)
    if (!existingMaquinaria) {
      throw new Error('No existe una maquinaria con el código proporcionado.')
    }
    return await this.repository.delete(cod_maquina)
  }
}
