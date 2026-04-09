import { PrismaClient, cliente, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'
import type { PaginationParams } from '../../shared/types/pagination.js'

export interface ClienteDeleteDependencyCounts {
  obras: number
  visitasConObra: number
  visitasInicialesSinObra: number
}

export class ClienteRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(data: Prisma.clienteCreateInput): Promise<cliente> {
    return await this.prisma.cliente.create({
      data,
    })
  }

  async findById(cuil: string): Promise<cliente | null> {
    return await this.prisma.cliente.findUnique({
      where: { cuil: cuil },
    })
  }

  async findAll(
    search?: string,
    paginationConfig?: PaginationParams
  ): Promise<{ data: cliente[]; total: number }> {
    const whereClause: Prisma.clienteWhereInput = search ? {
      OR: [
        { razon_social: { contains: search, mode: 'insensitive' } },
        { cuil: { contains: search, mode: 'insensitive' } },
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
      ],
    } : {}

    const skip = paginationConfig
      ? (paginationConfig.page - 1) * paginationConfig.pageSize
      : undefined
    const take = paginationConfig ? paginationConfig.pageSize : undefined

    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where: whereClause,
        orderBy: { razon_social: 'asc' },
        skip,
        take,
      }),
      this.prisma.cliente.count({ where: whereClause })
    ])

    return { data, total }
  }

  async update(
    cuil: string,
    data: Prisma.clienteUpdateInput,
  ): Promise<cliente> {
    return await this.prisma.cliente.update({
      where: { cuil: cuil },
      data,
    })
  }

  async delete(cuil: string): Promise<cliente> {
    return await this.prisma.cliente.delete({
      where: { cuil: cuil },
    })
  }

  async countDeleteDependencies(
    cuil: string,
  ): Promise<ClienteDeleteDependencyCounts> {
    const [obras, visitasConObra] = await this.prisma.$transaction([
      this.prisma.obra.count({
        where: {
          OR: [{ cuil }, { cuil_arquitecto: cuil }],
        },
      }),
      this.prisma.visita.count({
        where: {
          obra: {
            OR: [{ cuil }, { cuil_arquitecto: cuil }],
          },
        },
      }),
    ])

    return {
      obras,
      visitasConObra,
      visitasInicialesSinObra: 0,
    }
  }
}
