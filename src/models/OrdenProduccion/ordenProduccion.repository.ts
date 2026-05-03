import { PrismaClient, orden_de_produccion, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export interface OrdenProduccionFilters {
  estado?: string
  fechaDesde?: string
  fechaHasta?: string
  cod_obra?: number
}

export class OrdenProduccionRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(
    data: Prisma.orden_de_produccionCreateInput,
  ): Promise<orden_de_produccion> {
    return await this.prisma.orden_de_produccion.create({
      data,
    })
  }

  async findAll(filters?: OrdenProduccionFilters): Promise<orden_de_produccion[]> {
    const andConditions: Prisma.orden_de_produccionWhereInput[] = []

    if (filters?.estado) {
      andConditions.push({ estado: filters.estado })
    }

    if (filters?.cod_obra) {
      andConditions.push({ cod_obra: filters.cod_obra })
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      const fechaConfeccionFilter: Prisma.DateTimeFilter = {}

      if (filters.fechaDesde) {
        const fechaDesde = new Date(`${filters.fechaDesde}T00:00:00`)
        fechaConfeccionFilter.gte = fechaDesde
      }

      if (filters.fechaHasta) {
        const fechaHasta = new Date(`${filters.fechaHasta}T23:59:59.999`)
        fechaConfeccionFilter.lte = fechaHasta
      }

      andConditions.push({ fecha_confeccion: fechaConfeccionFilter })
    }

    return await this.prisma.orden_de_produccion.findMany({
      where: andConditions.length ? { AND: andConditions } : undefined,
      orderBy: { fecha_confeccion: 'desc' },
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
            visita: {
              orderBy: { fecha_hora_visita: 'desc' },
            },
          },
        },
      },
    })
  }

  async findById(cod_op: number): Promise<orden_de_produccion | null> {
    return await this.prisma.orden_de_produccion.findUnique({
      where: { cod_op },
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
            visita: {
              orderBy: { fecha_hora_visita: 'desc' },
            },
          },
        },
      },
    })
  }

  async findAprobadas(): Promise<orden_de_produccion[]> {
    return await this.prisma.orden_de_produccion.findMany({
      where: {
        estado: 'APROBADA',
      },
      orderBy: { fecha_validacion: 'desc' },
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
            visita: {
              orderBy: { fecha_hora_visita: 'desc' },
            },
          },
        },
      },
    })
  }

  async findEnProduccion(): Promise<orden_de_produccion[]> {
    return await this.prisma.orden_de_produccion.findMany({
      where: {
        estado: 'EN PRODUCCION',
      },
      orderBy: { fecha_validacion: 'desc' },
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
            visita: {
              orderBy: { fecha_hora_visita: 'desc' },
            },
          },
        },
      },
    })
  }

  async findByObra(cod_obra: number): Promise<orden_de_produccion[]> {
    return await this.prisma.orden_de_produccion.findMany({
      where: {cod_obra},
      orderBy: { fecha_confeccion: 'desc' },
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
            visita: {
              orderBy: { fecha_hora_visita: 'desc' },
            },
          },
        },
      },
    })
  }


  async findByObraAndFinalizada(cod_obra: number): Promise<orden_de_produccion[]> {
    return await this.prisma.orden_de_produccion.findMany({
      where: {
        cod_obra,
        estado: 'FINALIZADA',
      },
      orderBy: { fecha_confeccion: 'desc' },
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
            visita: {
              orderBy: { fecha_hora_visita: 'desc' },
            },
          },
        },
      },
    })
  }

  async update(
    cod_op: number,
    data: Prisma.orden_de_produccionUpdateInput,
  ): Promise<orden_de_produccion> {
    return await this.prisma.orden_de_produccion.update({
      where: { cod_op },
      data,
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
            visita: {
              orderBy: { fecha_hora_visita: 'desc' },
            },
          },
        },
      },
    })
  }

  async delete(cod_op: number): Promise<orden_de_produccion> {
    return await this.prisma.orden_de_produccion.delete({
      where: { cod_op },
    })
  }
}
