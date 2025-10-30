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

  async buscar(q: string): Promise<cliente[]> {
    console.log('Buscando clientes con query:', q) // --- IGNORE ---
    return await this.prisma.cliente.findMany({
      where: {
        OR: [
          { razon_social: { contains: q, mode: 'insensitive' } },
          { cuil: { contains: q, mode: 'insensitive' } },
          { nombre: { contains: q, mode: 'insensitive' } },
          { apellido: { contains: q, mode: 'insensitive' } },
        ],
      },
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
}
