import { PrismaClient, visita, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class VisitaRepository {
  private prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  // Obtener todas las visitas
  async findAll(estado?: string): Promise<visita[]> {
    const whereClause: Prisma.visitaWhereInput = estado
      ? { estado: { equals: estado, mode: 'insensitive' } }
      : {}

    return await this.prisma.visita.findMany({
      where: whereClause,
      orderBy: { fecha_hora_visita: 'desc' },
      include: {
        obra: {
          include: {
            cliente: true,
          },
        },
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
        obra: {
          include: {
            cliente: true,
          },
        },
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
        obra: {
          include: {
            cliente: true,
          },
        },
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
        obra: {
          include: {
            cliente: {
              select: {
                razon_social: true,
                telefono: true,
                mail: true,
              },
            },
          },
        },
        localidad: true,
        empleado_visita: {
          include: {
            empleado: {
              select: {
                cuil: true,
                nombre: true,
                apellido: true,
                rol_actual: true,
              },
            },
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
        empleado_visita: true,
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
        empleado_visita: true,
        uso_vehiculo_visita: {
          include: {
            vehiculo: true,
          },
        },
      },
    })
  }

  async buscar(
    q: string,
    limit?: number,
    offset?: number,
    estado?: string,
  ): Promise<visita[]> {
    const filters: Prisma.visitaWhereInput[] = [
      {
        OR: [
          { direccion_visita: { contains: q, mode: 'insensitive' } },
          { nombre_cliente: { contains: q, mode: 'insensitive' } },
          { apellido_cliente: { contains: q, mode: 'insensitive' } },
          {
            obra: {
              cliente: {
                OR: [
                  { nombre: { contains: q, mode: 'insensitive' } },
                  { apellido: { contains: q, mode: 'insensitive' } },
                  { razon_social: { contains: q, mode: 'insensitive' } },
                ],
              },
            },
          },
          {
            obra: {
              direccion: { contains: q, mode: 'insensitive' },
            },
          },
        ],
      },
    ]

    if (estado) {
      filters.push({ estado: { equals: estado, mode: 'insensitive' } })
    }

    return await this.prisma.visita.findMany({
      where: { AND: filters },
      include: {
        obra: {
          include: {
            cliente: true,
          },
        },
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
      take: limit,
      skip: offset,
      orderBy: { fecha_hora_visita: 'desc' },
    })
  }

  async findByEmpleadoAndEstado(
    cuil: string,
    estado: string | string[],
    search?: string,
    date?: string,
  ): Promise<visita[]> {
    const whereClause: Prisma.visitaWhereInput = {
      estado: Array.isArray(estado) ? { in: estado } : estado,
      empleado_visita: {
        some: {
          cuil: cuil,
        },
      },
    }

    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      whereClause.fecha_hora_visita = {
        gte: startOfDay,
        lt: endOfDay,
      }
    }

    if (search) {
      whereClause.OR = [
        { direccion_visita: { contains: search, mode: 'insensitive' } },
        { nombre_cliente: { contains: search, mode: 'insensitive' } },
        { apellido_cliente: { contains: search, mode: 'insensitive' } },
        { motivo_visita: { contains: search, mode: 'insensitive' } },
        {
          obra: {
            OR: [
              { direccion: { contains: search, mode: 'insensitive' } },
              {
                cliente: {
                  OR: [
                    { nombre: { contains: search, mode: 'insensitive' } },
                    { apellido: { contains: search, mode: 'insensitive' } },
                    { razon_social: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          },
        },
      ]
    }

    return await this.prisma.visita.findMany({
      where: whereClause,
      include: {
        obra: {
          include: {
            cliente: true,
          },
        },
        empleado_visita: {
          include: {
            empleado: true,
          },
        },
        localidad: {
          select: {
            cod_localidad: true,
            nombre_localidad: true,
          },
        },
      },
      orderBy: {
        fecha_hora_visita: 'desc',
      },
    })
  }

  // Obtener todas las visitas de un empleado
  async findByEmpleado(
    cuil: string,
    estados?: string[],
    search?: string,
    date?: string,
  ): Promise<visita[]> {
    const whereClause: Prisma.visitaWhereInput = {
      empleado_visita: {
        some: {
          cuil: cuil,
        },
      },
    }
    if (estados && estados.length > 0) {
      whereClause.estado = { in: estados }
    }

    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      whereClause.fecha_hora_visita = {
        gte: startOfDay,
        lt: endOfDay,
      }
    }

    if (search) {
      whereClause.OR = [
        { direccion_visita: { contains: search, mode: 'insensitive' } },
        { nombre_cliente: { contains: search, mode: 'insensitive' } },
        { apellido_cliente: { contains: search, mode: 'insensitive' } },
        { motivo_visita: { contains: search, mode: 'insensitive' } },
        {
          obra: {
            OR: [
              { direccion: { contains: search, mode: 'insensitive' } },
              {
                cliente: {
                  OR: [
                    { nombre: { contains: search, mode: 'insensitive' } },
                    { apellido: { contains: search, mode: 'insensitive' } },
                    { razon_social: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          },
        },
      ]
    }

    return await this.prisma.visita.findMany({
      where: whereClause,
      include: {
        obra: {
          select: {
            cod_obra: true,
            direccion: true,
            cliente: {
              select: {
                razon_social: true,
              },
            },
          },
        },
        empleado_visita: {
          include: {
            empleado: {
              select: {
                cuil: true,
                nombre: true,
                apellido: true,
                rol_actual: true,
              },
            },
          },
        },
        localidad: {
          select: {
            cod_localidad: true,
            nombre_localidad: true,
          },
        },
      },
      orderBy: {
        fecha_hora_visita: 'desc',
      },
    })
  }
}

export const visitaRepository = new VisitaRepository()
