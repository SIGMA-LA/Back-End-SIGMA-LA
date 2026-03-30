import { PrismaClient, uso_vehiculo_entrega, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class UsoVehiculoEntregaRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(
    data: Prisma.uso_vehiculo_entregaCreateInput,
  ): Promise<uso_vehiculo_entrega> {
    return await this.prisma.uso_vehiculo_entrega.create({ data })
  }

  async findAll(): Promise<uso_vehiculo_entrega[]> {
    return await this.prisma.uso_vehiculo_entrega.findMany({
      orderBy: { fecha_hora_ini_uso: 'desc' },
    })
  }

  async findById(
    cod_entrega: number,
    patente: string,
  ): Promise<uso_vehiculo_entrega | null> {
    return await this.prisma.uso_vehiculo_entrega.findUnique({
      where: {
        patente_cod_entrega: {
          patente: patente,
          cod_entrega: cod_entrega,
        },
      },
    })
  }

  async update(
    cod_entrega: number,
    patente: string,
    data: Prisma.uso_vehiculo_entregaUpdateInput,
  ): Promise<uso_vehiculo_entrega> {
    return await this.prisma.uso_vehiculo_entrega.update({
      where: {
        patente_cod_entrega: {
          patente: patente,
          cod_entrega: cod_entrega,
        },
      },
      data,
    })
  }

  async delete(
    cod_entrega: number,
    patente: string,
  ): Promise<uso_vehiculo_entrega> {
    return await this.prisma.uso_vehiculo_entrega.delete({
      where: {
        patente_cod_entrega: {
          patente: patente,
          cod_entrega: cod_entrega,
        },
      },
    })
  }
}
