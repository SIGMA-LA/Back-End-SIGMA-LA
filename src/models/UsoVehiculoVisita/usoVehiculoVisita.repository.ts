import { PrismaClient, uso_vehiculo_visita, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class UsoVehiculoVisitaRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(
    data: Prisma.uso_vehiculo_visitaCreateInput,
  ): Promise<uso_vehiculo_visita> {
    return await this.prisma.uso_vehiculo_visita.create({
      data,
    })
  }

  async findAll(): Promise<uso_vehiculo_visita[]> {
    return await this.prisma.uso_vehiculo_visita.findMany({
      orderBy: { fecha_hora_ini_uso: 'desc' },
    })
  }

  async findById(
    patente: string,
    cod_visita: number,
  ): Promise<uso_vehiculo_visita | null> {
    return await this.prisma.uso_vehiculo_visita.findUnique({
      where: {
        patente_cod_visita: {
          patente: patente,
          cod_visita: cod_visita,
        },
      },
    })
  }

  async update(
    patente: string,
    cod_visita: number,
    data: Prisma.uso_vehiculo_visitaUpdateInput,
  ): Promise<uso_vehiculo_visita> {
    return await this.prisma.uso_vehiculo_visita.update({
      where: {
        patente_cod_visita: {
          patente: patente,
          cod_visita: cod_visita,
        },
      },
      data,
    })
  }

  async delete(
    patente: string,
    cod_visita: number,
  ): Promise<uso_vehiculo_visita> {
    return await this.prisma.uso_vehiculo_visita.delete({
      where: {
        patente_cod_visita: {
          patente: patente,
          cod_visita: cod_visita,
        },
      },
    })
  }
}
