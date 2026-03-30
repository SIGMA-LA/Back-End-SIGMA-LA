import { PrismaClient, localidad, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class LocalidadRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(data: Prisma.localidadCreateInput): Promise<localidad> {
    return await this.prisma.localidad.create({
      data,
    })
  }
  async findByProvincia(cod_provincia: number): Promise<localidad[]> {
    return await this.prisma.localidad.findMany({
      where: { cod_provincia },
      orderBy: { nombre_localidad: 'asc' },
    })
  }

  async findAll(): Promise<localidad[]> {
    return await this.prisma.localidad.findMany({
      orderBy: { nombre_localidad: 'asc' },
    })
  }

  async findById(cod_localidad: number): Promise<localidad | null> {
    return await this.prisma.localidad.findUnique({
      where: { cod_localidad },
    })
  }

  async update(
    cod_localidad: number,
    data: Prisma.localidadUpdateInput,
  ): Promise<localidad> {
    return await this.prisma.localidad.update({
      where: { cod_localidad },
      data,
    })
  }

  async delete(cod_localidad: number): Promise<localidad> {
    return await this.prisma.localidad.delete({
      where: { cod_localidad },
    })
  }
}
