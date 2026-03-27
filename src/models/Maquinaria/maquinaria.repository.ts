import {
  PrismaClient,
  maquinaria,
  Prisma,
  uso_maquinaria,
} from '@prisma/client'
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

  async findAll(filters?: {
    search?: string
    estado?: string
  }): Promise<maquinaria[]> {
    const where: Prisma.maquinariaWhereInput = {}
    if (filters?.estado) {
      where.estado = filters.estado
    }
    if (filters?.search) {
      where.descripcion = { contains: filters.search }
    }
    return await this.prisma.maquinaria.findMany({
      where,
      orderBy: { descripcion: 'asc' },
    })
  }

  async findConflictingUsageForIds(
    maquinariaIds: number[],
    fechaInicio: Date,
    fechaFin: Date,
  ) {
    return await this.prisma.uso_maquinaria.findMany({
      where: {
        cod_maquina: {
          in: maquinariaIds,
        },
        AND: [
          { fecha_hora_ini_uso: { lt: fechaFin } },
          { fecha_hora_fin_est: { gt: fechaInicio } },
          { entrega: { estado: { not: 'CANCELADO' } } },
        ],
      },
      include: {
        maquinaria: {
          select: {
            descripcion: true,
          },
        },
      },
    })
  }

  async findAllWithUsageInRange(
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<(maquinaria & { uso_maquinaria: uso_maquinaria[] })[]> {
    return await this.prisma.maquinaria.findMany({
      include: {
        uso_maquinaria: {
          where: {
            AND: [
              { fecha_hora_ini_uso: { lt: fechaFin } },
              { fecha_hora_fin_est: { gt: fechaInicio } },
              { entrega: { estado: { not: 'CANCELADO' } } },
            ],
          },
        },
      },
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
