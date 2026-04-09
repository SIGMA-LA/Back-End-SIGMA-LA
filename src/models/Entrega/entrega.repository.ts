import { PrismaClient, entrega, Prisma } from '@prisma/client'

import { prisma } from '../../shared/db/prismaClient.js'
import type { PaginationParams } from '../../shared/types/pagination.js'

const defaultInclude = {
  obra: {
    include: {
      cliente: true,
      localidad: true,
    },
  },
  entrega_empleado: {
    include: {
      empleado: {
        select: {
          cuil: true,
          nombre: true,
          apellido: true,
        },
      },
    },
  },
  uso_maquinaria: {
    include: {
      maquinaria: {
        select: {
          descripcion: true,
        },
      },
    },
  },
  uso_vehiculo_entrega: {
    include: {
      vehiculo: {
        select: {
          patente: true,
          tipo_vehiculo: true,
        },
      },
    },
  },
  ordenes_de_produccion: true,
} satisfies Prisma.entregaInclude

export type EntregaWithRelations = Prisma.entregaGetPayload<{
  include: typeof defaultInclude
}>

export class EntregaRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(data: Prisma.entregaCreateInput): Promise<EntregaWithRelations> {
    return this.prisma.entrega.create({ data, include: defaultInclude })
  }

  async findAll(
    search?: string,
    estado?: string,
    paginationConfig?: PaginationParams
  ): Promise<{ data: EntregaWithRelations[]; total: number }> {
    const whereClause: Prisma.entregaWhereInput = {}

    if (estado) {
      whereClause.estado = estado
    }

    if (search) {
      whereClause.OR = [
        { detalle: { contains: search, mode: 'insensitive' } },
        { observaciones: { contains: search, mode: 'insensitive' } },
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
      this.prisma.entrega.findMany({
        where: whereClause,
        orderBy: { fecha_hora_entrega: 'desc' },
        include: defaultInclude,
        skip,
        take,
      }),
      this.prisma.entrega.count({ where: whereClause })
    ])

    return { data: data as EntregaWithRelations[], total }
  }

  async getByEmpleadoEstado(
    cuil_empleado: string,
    estado: string,
    search?: string,
    date?: string,
    paginationConfig?: PaginationParams,
  ): Promise<{ data: EntregaWithRelations[]; total: number }> {
    const whereClause: Prisma.entregaWhereInput = {
      estado: estado,
      entrega_empleado: {
        some: {
          cuil: cuil_empleado,
        },
      },
    }

    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      whereClause.fecha_hora_entrega = {
        gte: startOfDay,
        lt: endOfDay,
      }
    }

    if (search) {
      whereClause.OR = [
        { detalle: { contains: search, mode: 'insensitive' } },
        { observaciones: { contains: search, mode: 'insensitive' } },
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
      this.prisma.entrega.findMany({
        where: whereClause,
        include: defaultInclude,
        orderBy: { fecha_hora_entrega: 'desc' },
        skip,
        take,
      }),
      this.prisma.entrega.count({ where: whereClause }),
    ])

    return { data: data as EntregaWithRelations[], total }
  }

  async findById(cod_entrega: number): Promise<EntregaWithRelations | null> {
    return this.prisma.entrega.findUnique({
      where: { cod_entrega },
      include: defaultInclude,
    })
  }

  async update(
    cod_entrega: number,
    data: Prisma.entregaUpdateInput,
  ): Promise<EntregaWithRelations> {
    return this.prisma.entrega.update({
      where: { cod_entrega },
      data,
      include: defaultInclude,
    })
  }

  async delete(cod_entrega: number): Promise<entrega> {
    return this.prisma.entrega.delete({
      where: { cod_entrega },
    })
  }
}
