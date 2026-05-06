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
      include: { provincia: true },
    })
  }

  async findByProvincia(cod_provincia: number): Promise<localidad[]> {
    return await this.prisma.localidad.findMany({
      where: { cod_provincia },
      include: { provincia: true },
      orderBy: { nombre_localidad: 'asc' },
    })
  }

  async findAll(): Promise<localidad[]> {
    return await this.prisma.localidad.findMany({
      include: { provincia: true },
      orderBy: { nombre_localidad: 'asc' },
    })
  }

  async findById(cod_localidad: number): Promise<localidad | null> {
    return await this.prisma.localidad.findUnique({
      where: { cod_localidad },
      include: { provincia: true },
    })
  }

  async update(
    cod_localidad: number,
    data: Prisma.localidadUpdateInput,
  ): Promise<localidad> {
    return await this.prisma.localidad.update({
      where: { cod_localidad },
      data,
      include: { provincia: true },
    })
  }

  async findByNombreAndProvincia(
    nombre_localidad: string,
    cod_provincia: number,
  ): Promise<localidad | null> {
    return await this.prisma.localidad.findFirst({
      where: {
        nombre_localidad: {
          equals: nombre_localidad,
          mode: 'insensitive',
        },
        cod_provincia,
      },
      include: { provincia: true },
    })
  }

  async search(searchTerm: string): Promise<localidad[]> {
    return await this.prisma.localidad.findMany({
      where: {
        nombre_localidad: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: { provincia: true },
      orderBy: { nombre_localidad: 'asc' },
    })
  }

  async delete(cod_localidad: number): Promise<localidad> {
    return await this.prisma.localidad.delete({
      where: { cod_localidad },
    })
  }

  async hasRelatedEntities(cod_localidad: number): Promise<boolean> {
    const obraCount = await this.prisma.obra.count({ where: { cod_localidad } })
    const visitaCount = await this.prisma.visita.count({ where: { cod_localidad } })
    return obraCount > 0 || visitaCount > 0
  }
}
