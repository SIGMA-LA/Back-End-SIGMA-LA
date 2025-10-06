import { PrismaClient, maquinaria, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class MaquinariaRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(data: Prisma.maquinariaCreateInput): Promise<maquinaria> {
    return await this.prisma.maquinaria.create({
      data,
    })
  }

  async findAll(): Promise<maquinaria[]> {
    return await this.prisma.maquinaria.findMany({
      orderBy: { descripcion: 'asc' },
    })
  }

  async findById(cod_maquina: number): Promise<maquinaria | null> {
    return await this.prisma.maquinaria.findUnique({
      where: { cod_maquina },
    })
  }

  async findByEstado(estado: string): Promise<maquinaria[]> {
    return await this.prisma.maquinaria.findMany({
      where: { estado },
      orderBy: { descripcion: 'asc' },
    })
  }

  async update(
    cod_maquina: number,
    data: Prisma.maquinariaUpdateInput,
  ): Promise<maquinaria> {
    return await this.prisma.maquinaria.update({
      where: { cod_maquina },
      data,
    })
  }

  async delete(cod_maquina: number): Promise<maquinaria> {
    return await this.prisma.maquinaria.delete({
      where: { cod_maquina },
    })
  }
}
