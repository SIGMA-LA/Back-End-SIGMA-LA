import { VisitaRepository } from './visita.repository.js'
import { visita, Prisma } from '@prisma/client'

/**
 * Servicio para manejar la lógica de negocio de visitas.
 * @class VisitaService
 * @method create - Crea una nueva visita validando que no exista la combinación fecha_hora_visita + cod_obra.
 * @method findAll - Obtiene todas las visitas.
 * @method findById - Obtiene una visita por su clave compuesta.
 * @method update - Actualiza una visita existente verificando que existe.
 * @method remove - Elimina una visita por su clave compuesta verificando que existe.
 * @returns {Promise<visita | visita[] | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class VisitaService {
  private visitaRepository: VisitaRepository

  constructor() {
    this.visitaRepository = new VisitaRepository()
  }

  // Crear nueva visita
  async create(data: {
    fecha_hora_visita: Date
    cod_obra: number
    cod_postal: number
    motivo_visita: string
    estado: string
    observaciones?: string
    direccion_visita?: string
  }): Promise<visita> {
    const existingVisita = await this.visitaRepository.findById(
      data.fecha_hora_visita,
      data.cod_obra,
    )
    if (existingVisita) {
      throw new Error('Ya existe una visita con esa fecha, hora y obra')
    }

    return await this.visitaRepository.create({
      fecha_hora_visita: data.fecha_hora_visita,
      motivo_visita: data.motivo_visita,
      estado: data.estado,
      observaciones: data.observaciones,
      direccion_visita: data.direccion_visita,
      obra: {
        connect: { cod_obra: data.cod_obra },
      },
      localidad: {
        connect: { cod_postal: data.cod_postal },
      },
    })
  }

  // Obtener todas las visitas
  async findAll(): Promise<visita[]> {
    return await this.visitaRepository.findAll()
  }

  // Obtener visita por clave compuesta
  async findById(
    fecha_hora_visita: Date,
    cod_obra: number,
  ): Promise<visita | null> {
    return await this.visitaRepository.findById(fecha_hora_visita, cod_obra)
  }

  // Actualizar visita
  async update(
    fecha_hora_visita: Date,
    cod_obra: number,
    data: {
      cod_postal?: number
      motivo_visita?: string
      estado?: string
      observaciones?: string
      direccion_visita?: string
      fecha_cancelacion?: Date
    },
  ): Promise<visita> {
    const existingVisita = await this.visitaRepository.findById(
      fecha_hora_visita,
      cod_obra,
    )
    if (!existingVisita) {
      throw new Error('Visita no encontrada')
    }

    // Separar cod_postal del resto de los datos
    const { cod_postal, ...updateFields } = data

    const updateData: Prisma.visitaUpdateInput = {
      ...updateFields,
      ...(cod_postal && {
        localidad: {
          connect: { cod_postal },
        },
      }),
    }

    return await this.visitaRepository.update(
      fecha_hora_visita,
      cod_obra,
      updateData,
    )
  }

  // Eliminar visita
  async remove(fecha_hora_visita: Date, cod_obra: number): Promise<visita> {
    const existingVisita = await this.visitaRepository.findById(
      fecha_hora_visita,
      cod_obra,
    )
    if (!existingVisita) {
      throw new Error('Visita no encontrada')
    }

    return await this.visitaRepository.remove(fecha_hora_visita, cod_obra)
  }

  // Obtener visitas por estado
  async findByEstado(estado: string): Promise<visita[]> {
    return await this.visitaRepository.findByEstado(estado)
  }

  // Obtener visitas por obra
  async findByObra(cod_obra: number): Promise<visita[]> {
    return await this.visitaRepository.findByObra(cod_obra)
  }
}

export const visitaService = new VisitaService()
