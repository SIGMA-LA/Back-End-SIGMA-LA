import { PrismaClient, provincia, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class ProvinciaRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }
  async findById(cod_provincia: number): Promise<provincia | null> {
    return await this.prisma.provincia.findUnique({
      where: { cod_provincia },
    })
  }

  async create(data: Prisma.provinciaCreateInput): Promise<provincia> {
    return await this.prisma.provincia.create({
      data,
    })
  }

  async findAll(): Promise<provincia[]> {
    return await this.prisma.provincia.findMany({
      orderBy: { nombre: 'asc' },
    })
  }
}
