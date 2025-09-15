import { PrismaClient, visita, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class VisitaRepository {
  private prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  // Obtener todas las visitas
  async findAll(): Promise<visita[]> {
    return await this.prisma.visita.findMany({
      orderBy: { fecha_hora_visita: 'desc' },
      include: {
        obra: true,
        localidad: true,
      },
    })
  }

  // Obtener visita por clave compuesta (fecha_hora_visita y cod_obra)
  async findById(
    fecha_hora_visita: Date,
    cod_obra: number,
  ): Promise<visita | null> {
    return await this.prisma.visita.findUnique({
      where: {
        fecha_hora_visita_cod_obra: {
          fecha_hora_visita,
          cod_obra,
        },
      },
      include: {
        obra: true,
        localidad: true,
      },
    })
  }

  // Crear nueva visita
  async create(data: Prisma.visitaCreateInput): Promise<visita> {
    return await this.prisma.visita.create({
      data,
      include: {
        obra: true,
        localidad: true,
      },
    })
  }

  // Actualizar visita
  async update(
    fecha_hora_visita: Date,
    cod_obra: number,
    data: Prisma.visitaUpdateInput,
  ): Promise<visita> {
    return await this.prisma.visita.update({
      where: {
        fecha_hora_visita_cod_obra: {
          fecha_hora_visita,
          cod_obra,
        },
      },
      data,
      include: {
        obra: true,
        localidad: true,
      },
    })
  }

  // Eliminar visita
  async remove(fecha_hora_visita: Date, cod_obra: number): Promise<visita> {
    return await this.prisma.visita.delete({
      where: {
        fecha_hora_visita_cod_obra: {
          fecha_hora_visita,
          cod_obra,
        },
      },
    })
  }

  // Buscar por estado
  async findByEstado(estado: string): Promise<visita[]> {
    return await this.prisma.visita.findMany({
      where: { estado },
      orderBy: { fecha_hora_visita: 'desc' },
      include: {
        obra: true,
        localidad: true,
      },
    })
  }

  // Buscar por obra
  async findByObra(cod_obra: number): Promise<visita[]> {
    return await this.prisma.visita.findMany({
      where: { cod_obra },
      orderBy: { fecha_hora_visita: 'desc' },
      include: {
        obra: true,
        localidad: true,
      },
    })
  }
}

export const visitaRepository = new VisitaRepository()
