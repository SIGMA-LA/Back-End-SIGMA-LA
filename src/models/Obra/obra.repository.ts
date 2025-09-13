import { PrismaClient, obra, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class ObraRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(data: Prisma.obraCreateInput): Promise<obra> {
    return await this.prisma.obra.create({
      data,
    })
  }

  async findAll(): Promise<obra[]> {
    return await this.prisma.obra.findMany({
      orderBy: { cod_obra: 'desc' },
    })
  }

  async findById(cod_obra: number): Promise<obra | null> {
    return await this.prisma.obra.findUnique({
      where: { cod_obra },
    })
  }

  async update(cod_obra: number, data: Prisma.obraUpdateInput): Promise<obra> {
    return await this.prisma.obra.update({
      where: { cod_obra },
      data,
    })
  }

  async delete(cod_obra: number): Promise<obra> {
    return await this.prisma.obra.delete({
      where: { cod_obra },
    })
  }
}
