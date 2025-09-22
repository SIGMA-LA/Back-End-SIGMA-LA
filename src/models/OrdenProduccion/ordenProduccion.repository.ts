import { PrismaClient, orden_de_produccion, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class OrdenProduccionRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(
    data: Prisma.orden_de_produccionCreateInput,
  ): Promise<orden_de_produccion> {
    return await this.prisma.orden_de_produccion.create({
      data,
    })
  }

  async findAll(): Promise<orden_de_produccion[]> {
    return await this.prisma.orden_de_produccion.findMany({
      orderBy: { fecha_confeccion: 'desc' },
    })
  }

  async findById(cod_op: number): Promise<orden_de_produccion | null> {
    return await this.prisma.orden_de_produccion.findUnique({
      where: { cod_op },
    })
  }

  async update(
    cod_op: number,
    data: Prisma.orden_de_produccionUpdateInput,
  ): Promise<orden_de_produccion> {
    return await this.prisma.orden_de_produccion.update({
      where: { cod_op },
      data,
    })
  }

  async delete(cod_op: number): Promise<orden_de_produccion> {
    return await this.prisma.orden_de_produccion.delete({
      where: { cod_op },
    })
  }
}
