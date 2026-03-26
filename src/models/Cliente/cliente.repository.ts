import { PrismaClient, cliente, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

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

  async findAll(): Promise<cliente[]> {
    return await this.prisma.cliente.findMany({
      orderBy: { razon_social: 'asc' },
    })
  }

  async findById(cuil: string): Promise<cliente | null> {
    return await this.prisma.cliente.findUnique({
      where: { cuil: cuil },
    })
  }
  async buscar(q: string, limit?: number, offset?: number): Promise<cliente[]> {
    return await this.prisma.cliente.findMany({
      where: {
        OR: [
          { razon_social: { contains: q, mode: 'insensitive' } },
          { cuil: { contains: q, mode: 'insensitive' } },
          { nombre: { contains: q, mode: 'insensitive' } },
          { apellido: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      skip: offset,
      orderBy: { razon_social: 'asc' },
    })
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
