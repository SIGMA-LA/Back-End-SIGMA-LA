import { PrismaClient, cliente, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

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

  async findById(cuil: bigint): Promise<cliente | null> {
    return await this.prisma.cliente.findUnique({
      where: { cuil },
    })
  }

  async update(
    cuil: bigint,
    data: Prisma.clienteUpdateInput,
  ): Promise<cliente> {
    return await this.prisma.cliente.update({
      where: { cuil },
      data,
    })
  }

  async delete(cuil: bigint): Promise<cliente> {
    return await this.prisma.cliente.delete({
      where: { cuil },
    })
  }
}
