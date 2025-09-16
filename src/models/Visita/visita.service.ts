import { VisitaRepository } from './visita.repository.js'
import { visita, Prisma } from '@prisma/client'

/**
 * Servicio para manejar la lógica de negocio de visitas.
 * @class VisitaService
 * @method create - Crea una nueva visita con soporte para campos opcionales.
 * @method findAll - Obtiene todas las visitas.
 * @method findById - Obtiene una visita por su cod_visita.
 * @method update - Actualiza una visita existente verificando que existe.
 * @method remove - Elimina una visita por su cod_visita verificando que existe.
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
    fecha_hora_visita: string
    cod_obra?: number
    cod_postal?: number
    motivo_visita: string
    estado: string
    observaciones?: string
    direccion_visita?: string
  }): Promise<visita> {
    // Construir el objeto de creación dinámicamente
    const createData: Prisma.visitaCreateInput = {
      fecha_hora_visita: new Date(data.fecha_hora_visita),
      motivo_visita: data.motivo_visita,
      estado: data.estado,
      observaciones: data.observaciones,
      direccion_visita: data.direccion_visita,
    }

    // Conectar obra si se proporciona
    if (data.cod_obra) {
      createData.obra = {
        connect: { cod_obra: data.cod_obra },
      }
    }

    // Conectar localidad si se proporciona
    if (data.cod_postal) {
      createData.localidad = {
        connect: { cod_postal: data.cod_postal },
      }
    }

    return await this.visitaRepository.create(createData)
  }

  // Obtener todas las visitas
  async findAll(): Promise<visita[]> {
    return await this.visitaRepository.findAll()
  }

  // Obtener visita por cod_visita
  async findById(cod_visita: number): Promise<visita | null> {
    return await this.visitaRepository.findById(cod_visita)
  }

  // Actualizar visita
  async update(
    cod_visita: number,
    data: {
      fecha_hora_visita?: string
      cod_obra?: number
      cod_postal?: number
      motivo_visita?: string
      estado?: string
      observaciones?: string
      direccion_visita?: string
      fecha_cancelacion?: string
    },
  ): Promise<visita> {
    const existingVisita = await this.visitaRepository.findById(cod_visita)
    if (!existingVisita) {
      throw new Error('Visita no encontrada')
    }

    // Separar los campos que necesitan conectores de los campos simples
    const {
      cod_obra,
      cod_postal,
      fecha_hora_visita,
      fecha_cancelacion,
      ...simpleFields
    } = data

    const updateData: Prisma.visitaUpdateInput = {
      ...simpleFields,
      ...(fecha_hora_visita && {
        fecha_hora_visita: new Date(fecha_hora_visita),
      }),
      ...(fecha_cancelacion && {
        fecha_cancelacion: new Date(fecha_cancelacion),
      }),
    }

    // Conectar obra si se proporciona
    if (cod_obra !== undefined) {
      if (cod_obra === null) {
        updateData.obra = { disconnect: true }
      } else {
        updateData.obra = { connect: { cod_obra } }
      }
    }

    // Conectar localidad si se proporciona
    if (cod_postal !== undefined) {
      if (cod_postal === null) {
        updateData.localidad = { disconnect: true }
      } else {
        updateData.localidad = { connect: { cod_postal } }
      }
    }

    return await this.visitaRepository.update(cod_visita, updateData)
  }

  // Eliminar visita
  async remove(cod_visita: number): Promise<visita> {
    const existingVisita = await this.visitaRepository.findById(cod_visita)
    if (!existingVisita) {
      throw new Error('Visita no encontrada')
    }

    return await this.visitaRepository.remove(cod_visita)
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
