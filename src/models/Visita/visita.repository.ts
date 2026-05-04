import { PrismaClient, visita, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'
import type { PaginationParams } from '../../shared/types/pagination.js'

export type VisitaWithRelations = Prisma.visitaGetPayload<{
  include: {
    obra: {
      include: {
        cliente: true,
        localidad: true,
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
}>

export class VisitaRepository {
  private prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  // Obtener todas las visitas
  async findAll(
    estado?: string,
    paginationConfig?: PaginationParams
  ): Promise<{ data: VisitaWithRelations[]; total: number }> {
    const whereClause: Prisma.visitaWhereInput = estado
      ? { estado: { equals: estado, mode: 'insensitive' } }
      : {}

    const skip = paginationConfig
      ? (paginationConfig.page - 1) * paginationConfig.pageSize
      : undefined
    const take = paginationConfig ? paginationConfig.pageSize : undefined

    const includeOptions = {
        obra: {
          include: {
            cliente: true,
            localidad: true,
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
      }

    const [data, total] = await Promise.all([
      this.prisma.visita.findMany({
        where: whereClause,
        orderBy: { fecha_hora_visita: 'desc' },
        include: includeOptions,
        take,
        skip,
      }),
      this.prisma.visita.count({ where: whereClause }),
    ])

    return { data: data as VisitaWithRelations[], total }
  }

  // Obtener visita por cod_visita
  async findById(cod_visita: number): Promise<VisitaWithRelations | null> {
    return await this.prisma.visita.findUnique({
      where: {
        cod_visita,
      },
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
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
    }) as VisitaWithRelations | null
  }

  // Crear nueva visita
  async create(data: Prisma.visitaCreateInput): Promise<VisitaWithRelations> {
    return await this.prisma.visita.create({
      data,
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
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
    }) as VisitaWithRelations
  }

  // Actualizar visita
  async update(
    cod_visita: number,
    data: Prisma.visitaUpdateInput,
  ): Promise<VisitaWithRelations> {
    return await this.prisma.visita.update({
      where: {
        cod_visita,
      },
      data,
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
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
    }) as VisitaWithRelations
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
  async findByEstado(estado: string): Promise<VisitaWithRelations[]> {
    return await this.prisma.visita.findMany({
      where: { estado },
      orderBy: { fecha_hora_visita: 'desc' },
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
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
    }) as VisitaWithRelations[]
  }

  // Buscar por obra
  async findByObra(cod_obra: number): Promise<VisitaWithRelations[]> {
    return await this.prisma.visita.findMany({
      where: { cod_obra },
      orderBy: { fecha_hora_visita: 'desc' },
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
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
    }) as VisitaWithRelations[]
  }

  async buscar(
    q: string,
    paginationConfig?: PaginationParams,
    estado?: string,
  ): Promise<{ data: VisitaWithRelations[]; total: number }> {
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

    const skip = paginationConfig
      ? (paginationConfig.page - 1) * paginationConfig.pageSize
      : undefined
    const take = paginationConfig ? paginationConfig.pageSize : undefined

    const includeOptions = {
        obra: {
          include: {
            cliente: true,
            localidad: true,
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
      }

    const [data, total] = await Promise.all([
      this.prisma.visita.findMany({
        where: { AND: filters },
        include: includeOptions,
        take,
        skip,
        orderBy: { fecha_hora_visita: 'desc' },
      }),
      this.prisma.visita.count({ where: { AND: filters } })
    ])

    return { data: data as VisitaWithRelations[], total }
  }

  async findByEmpleadoAndEstado(
    cuil: string,
    estado: string | string[],
    search?: string,
    date?: string,
    paginationConfig?: PaginationParams,
  ): Promise<{ data: VisitaWithRelations[]; total: number }> {
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

    const skip = paginationConfig
      ? (paginationConfig.page - 1) * paginationConfig.pageSize
      : undefined
    const take = paginationConfig ? paginationConfig.pageSize : undefined

    const [data, total] = await Promise.all([
      this.prisma.visita.findMany({
        where: whereClause,
        include: {
          obra: {
            include: {
              cliente: true,
              localidad: true,
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
        orderBy: {
          fecha_hora_visita: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.visita.count({ where: whereClause })
    ])

    return { data: data as VisitaWithRelations[], total }
  }

  // Obtener todas las visitas de un empleado
  async findByEmpleado(
    cuil: string,
    estados?: string[],
    search?: string,
    date?: string,
    paginationConfig?: PaginationParams,
  ): Promise<{ data: VisitaWithRelations[]; total: number }> {
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

    const skip = paginationConfig
      ? (paginationConfig.page - 1) * paginationConfig.pageSize
      : undefined
    const take = paginationConfig ? paginationConfig.pageSize : undefined

    const [data, total] = await Promise.all([
      this.prisma.visita.findMany({
        where: whereClause,
        include: {
          obra: {
            include: {
              cliente: true,
              localidad: true,
            },
          },
          empleado_visita: {
            include: {
              empleado: true,
            },
          },
          localidad: true,
          uso_vehiculo_visita: {
            include: {
              vehiculo: true,
            },
          },
        },
        orderBy: {
          fecha_hora_visita: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.visita.count({ where: whereClause })
    ])

    return { data: data as VisitaWithRelations[], total }
  }
  // Obtener prospectos (visitas sin obra asignada)
  async findProspectos(
    estado?: string,
    paginationConfig?: PaginationParams
  ): Promise<{ data: VisitaWithRelations[]; total: number }> {
    const whereClause: Prisma.visitaWhereInput = {
      cod_obra: null,
      motivo_visita: 'INICIAL',
    }
    
    if (estado) {
      whereClause.estado = { equals: estado, mode: 'insensitive' }
    }

    const skip = paginationConfig
      ? (paginationConfig.page - 1) * paginationConfig.pageSize
      : undefined
    const take = paginationConfig ? paginationConfig.pageSize : undefined

    const includeOptions = {
        obra: {
          include: {
            cliente: true,
            localidad: true,
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
      }

    const [data, total] = await Promise.all([
      this.prisma.visita.findMany({
        where: whereClause,
        orderBy: { cod_visita: 'desc' },
        include: includeOptions,
        take,
        skip,
      }),
      this.prisma.visita.count({ where: whereClause }),
    ])

    return { data: data as VisitaWithRelations[], total }
  }
}

export const visitaRepository = new VisitaRepository()
