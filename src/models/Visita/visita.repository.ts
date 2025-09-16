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
        empleado_visita: {
          include: {
            empleado: true,
          },
        },
        uso_vehiculo_visita: {
          include: {
            vehiculo: true,
          },
        },
      },
    })
  }

  // Obtener visita por cod_visita
  async findById(cod_visita: number): Promise<visita | null> {
    return await this.prisma.visita.findUnique({
      where: {
        cod_visita,
      },
      include: {
        obra: true,
        localidad: true,
        empleado_visita: {
          include: {
            empleado: true,
          },
        },
        uso_vehiculo_visita: {
          include: {
            vehiculo: true,
          },
        },
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
        empleado_visita: {
          include: {
            empleado: true,
          },
        },
        uso_vehiculo_visita: {
          include: {
            vehiculo: true,
          },
        },
      },
    })
  }

  // Actualizar visita
  async update(
    cod_visita: number,
    data: Prisma.visitaUpdateInput,
  ): Promise<visita> {
    return await this.prisma.visita.update({
      where: {
        cod_visita,
      },
      data,
      include: {
        obra: true,
        localidad: true,
        empleado_visita: {
          include: {
            empleado: true,
          },
        },
        uso_vehiculo_visita: {
          include: {
            vehiculo: true,
          },
        },
      },
    })
  }

  // Eliminar visita
  async remove(cod_visita: number): Promise<visita> {
    return await this.prisma.visita.delete({
      where: {
        cod_visita,
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
        empleado_visita: {
          include: {
            empleado: true,
          },
        },
        uso_vehiculo_visita: {
          include: {
            vehiculo: true,
          },
        },
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
        empleado_visita: {
          include: {
            empleado: true,
          },
        },
        uso_vehiculo_visita: {
          include: {
            vehiculo: true,
          },
        },
      },
    })
  }
}

export const visitaRepository = new VisitaRepository()
