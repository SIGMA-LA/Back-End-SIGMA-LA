import { PrismaClient, entrega, Prisma } from '@prisma/client'

import { prisma } from '../../shared/db/prismaClient.js'

export class EntregaRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(data: Prisma.entregaCreateInput): Promise<entrega> {
    return this.prisma.entrega.create({ data })
  }

  async findAll(): Promise<entrega[]> {
    return this.prisma.entrega.findMany()
  }

  async findById(cod_entrega: number): Promise<entrega | null> {
    return this.prisma.entrega.findUnique({
      where: { cod_entrega },
    })
  }

  async update(
    cod_entrega: number,
    data: Prisma.entregaUpdateInput,
  ): Promise<entrega> {
    return this.prisma.entrega.update({
      where: { cod_entrega },
      data,
    })
  }

  async delete(cod_entrega: number): Promise<entrega> {
    return this.prisma.entrega.delete({
      where: { cod_entrega },
    })
  }
}
