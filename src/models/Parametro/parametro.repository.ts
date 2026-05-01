import { PrismaClient, parametro, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class ParametroRepository {
  private prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  // Obtener todos los empleados
  async findAll(): Promise<parametro[]> {
    return await this.prisma.parametro.findMany({
      orderBy: { fecha_cambio: 'asc' },
    })
  }

  // Obtener parametro por fecha y hora de cambio
  async findOne(id: number): Promise<parametro | null> {
    return await this.prisma.parametro.findUnique({
      where: { cod_parametro: id },
    })
  }

  async findLatest(): Promise<parametro | null> {
    return await this.prisma.parametro.findFirst({
      orderBy: [
        { fecha_cambio: 'desc' },
        { hora_cambio: 'desc' },
      ],
    });
  }

  // Crear nuevo parametro
  async create(data: Prisma.parametroCreateInput): Promise<parametro> {
    return await this.prisma.parametro.create({
      data,
    })
  }

  // Actualizar parametro
  async update(
    id: number,
    data: Prisma.parametroUpdateInput,
  ): Promise<parametro> {
    return await this.prisma.parametro.update({
      where: {
        cod_parametro: id,
      },
      data,
    })
  }

  // Eliminar parametro
  async delete(id: number): Promise<parametro> {
    return await this.prisma.parametro.delete({
      where: {
        cod_parametro: id,
      },
    })
  }

  // Obtener el máximo ID
  async findMaxId(): Promise<number> {
    const result = await this.prisma.parametro.aggregate({
      _max: { cod_parametro: true },
    })
    return result._max.cod_parametro || 0
  }

  // Contar total de parametros
  async count(): Promise<number> {
    return await this.prisma.parametro.count()
  }
}
