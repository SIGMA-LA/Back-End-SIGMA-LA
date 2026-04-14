import { PrismaClient, pago, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class PagoRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async createForObra(data: Prisma.pagoUncheckedCreateInput): Promise<pago> {
    return await this.prisma.pago.create({ data })
  }

  async createOne(data: Prisma.pagoCreateInput): Promise<pago> {
    return await this.prisma.pago.create({ data })
  }
  
  async findAll() {
    return await this.prisma.pago.findMany({
      orderBy: { fecha_pago: 'desc' },
      include: {
        obra: {
          include: {
            cliente: true,
          },
        },
      },
    })
  }

  async findAllWithFilters(filters: {
    search?: string
    cliente?: string
    fechaDesde?: string
    fechaHasta?: string
    obra?: string
    montoMin?: number
    montoMax?: number
  }) {
    const whereConditions: Prisma.pagoWhereInput = {}

    if (filters.fechaDesde || filters.fechaHasta) {
      whereConditions.fecha_pago = {}
      if (filters.fechaDesde) {
        whereConditions.fecha_pago.gte = new Date(filters.fechaDesde)
      }
      if (filters.fechaHasta) {
        whereConditions.fecha_pago.lte = new Date(filters.fechaHasta)
      }
    }

    if (filters.montoMin !== undefined || filters.montoMax !== undefined) {
      whereConditions.monto = {}
      if (filters.montoMin !== undefined) {
        whereConditions.monto.gte = filters.montoMin
      }
      if (filters.montoMax !== undefined) {
        whereConditions.monto.lte = filters.montoMax
      }
    }

    const andConditions: Prisma.pagoWhereInput[] = []

    if (filters.obra) {
      andConditions.push({
        obra: {
          direccion: {
            contains: filters.obra,
            mode: 'insensitive',
          },
        },
      })
    }

    if (filters.cliente) {
      andConditions.push({
        obra: {
          cliente: {
            OR: [
              {
                razon_social: {
                  contains: filters.cliente,
                  mode: 'insensitive',
                },
              },
              {
                nombre: {
                  contains: filters.cliente,
                  mode: 'insensitive',
                },
              },
              {
                apellido: {
                  contains: filters.cliente,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      })
    }

    if (filters.search) {
      andConditions.push({
        OR: [
          {
            obra: {
              direccion: { contains: filters.search, mode: 'insensitive' },
            },
          },
          {
            obra: {
              cliente: {
                OR: [
                  {
                    razon_social: {
                      contains: filters.search,
                      mode: 'insensitive',
                    },
                  },
                  { nombre: { contains: filters.search, mode: 'insensitive' } },
                  {
                    apellido: { contains: filters.search, mode: 'insensitive' },
                  },
                ],
              },
            },
          },
        ],
      })
    }

    if (andConditions.length > 0) {
      if (Object.keys(whereConditions).length > 0) {
        whereConditions.AND = andConditions
      } else {
        if (andConditions.length === 1) {
          Object.assign(whereConditions, andConditions[0])
        } else {
          whereConditions.AND = andConditions
        }
      }
    }

    return await this.prisma.pago.findMany({
      where: whereConditions,
      orderBy: { fecha_pago: 'desc' },
      include: {
        obra: {
          include: {
            cliente: true,
          },
        },
      },
      take: 1000,
    })
  }

  async findById(cod_pago: number): Promise<pago | null> {
    return await this.prisma.pago.findUnique({
      where: { cod_pago },
    })
  }

  async update(cod_pago: number, data: Prisma.pagoUpdateInput): Promise<pago> {
    return await this.prisma.pago.update({
      where: { cod_pago },
      data,
    })
  }

  async delete(cod_pago: number): Promise<pago> {
    return await this.prisma.pago.delete({
      where: { cod_pago },
    })
  }

  async findManyByObra(cod_obra: number): Promise<pago[]> {
    return await this.prisma.pago.findMany({
      where: { cod_obra },
      orderBy: { fecha_pago: 'desc' },
    })
  }
}
