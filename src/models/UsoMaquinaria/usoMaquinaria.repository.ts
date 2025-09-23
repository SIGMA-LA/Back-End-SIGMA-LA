import { PrismaClient, uso_maquinaria, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class UsoMaquinariaRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(
    data: Prisma.uso_maquinariaCreateInput,
  ): Promise<uso_maquinaria> {
    return await this.prisma.uso_maquinaria.create({
      data,
    })
  }

  async findAll(): Promise<uso_maquinaria[]> {
    return await this.prisma.uso_maquinaria.findMany({
      orderBy: { fecha_hora_ini_uso: 'desc' },
    })
  }

  async findById(
    cod_maquina: number,
    cod_entrega: number,
  ): Promise<uso_maquinaria | null> {
    return await this.prisma.uso_maquinaria.findUnique({
      where: {
        cod_maquina_cod_entrega: {
          cod_maquina,
          cod_entrega,
        },
      },
    })
  }

  async update(
    cod_maquina: number,
    cod_entrega: number,
    data: Prisma.uso_maquinariaUpdateInput,
  ): Promise<uso_maquinaria> {
    return await this.prisma.uso_maquinaria.update({
      where: {
        cod_maquina_cod_entrega: {
          cod_maquina,
          cod_entrega,
        },
      },
      data,
    })
  }

  async delete(
    cod_maquina: number,
    cod_entrega: number,
  ): Promise<uso_maquinaria> {
    return await this.prisma.uso_maquinaria.delete({
      where: {
        cod_maquina_cod_entrega: {
          cod_maquina,
          cod_entrega,
        },
      },
    })
  }
}
