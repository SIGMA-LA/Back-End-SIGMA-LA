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
      include: {
        cliente: true,
        localidad: true,
        presupuesto: true,
      },
    })
  }

  async findById(id: number): Promise<obra | null> {
    return await this.prisma.obra.findUnique({
      where: { cod_obra: id },
      include: {
        cliente: true,
        localidad: true,
        presupuesto: true,
      },
    })
  }
  async subirNotaFabrica(
    id: number,
    path: string,
    filename: string,
  ): Promise<void> {
    await this.prisma.obra.update({
      where: { cod_obra: id },
      data: {
        nota_fabrica: path,
        nota_fabrica_pid: filename,
      },
    })
  }

  async update(id: number, data: Prisma.obraUpdateInput): Promise<obra> {
    return await this.prisma.obra.update({
      where: { cod_obra: id },
      data,
    })
  }

  async delete(id: number): Promise<obra> {
    return await this.prisma.obra.update({
      where: { cod_obra: id },
      data: {
        estado: 'Eliminada',
      },
    })
  }

  async findNotasSinOrdenAprobada(): Promise<obra[]> {
    return await this.prisma.obra.findMany({
      where: {
        nota_fabrica: {
          not: null,
        },
        estado: {
          in: ['ACTIVA', 'EN PRODUCCION'],
        },
        orden_de_produccion: {
          none: {
            estado: {
              in: ['APROBADA', 'EN PRODUCCION'],
            },
          },
        },
      },
      orderBy: { fecha_ini: 'desc' },
      include: {
        cliente: true,
        localidad: true,
      },
    })
  }

  async findNotasConOrdenEnProceso(): Promise<obra[]> {
    return await this.prisma.obra.findMany({
      where: {
        nota_fabrica: {
          not: null,
        },
        estado: {
          in: ['ACTIVA', 'EN PRODUCCION'],
        },
        orden_de_produccion: {
          some: {
            estado: {
              in: ['APROBADA', 'EN PRODUCCION'],
            },
          },
        },
      },
      orderBy: { fecha_ini: 'desc' },
      include: {
        cliente: true,
        localidad: true,
      },
    })
  }
}
