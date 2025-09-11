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

  async findAll(): Promise<localidad[]> {
    return await this.prisma.localidad.findMany({
      orderBy: { nombre_localidad: 'asc' },
    })
  }

  async findById(cod_postal: number): Promise<localidad | null> {
    return await this.prisma.localidad.findUnique({
      where: { cod_postal },
    })
  }

  async update(
    cod_postal: number,
    data: Prisma.localidadUpdateInput,
  ): Promise<localidad> {
    return await this.prisma.localidad.update({
      where: { cod_postal },
      data,
    })
  }

  async delete(cod_postal: number): Promise<localidad> {
    return await this.prisma.localidad.delete({
      where: { cod_postal },
    })
  }
}
