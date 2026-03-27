import { PrismaClient, vehiculo, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class VehiculoRepository {
  private prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  // Obtener todos los vehiculos
  async findAll(filters?: {
    search?: string
    estado?: string
  }): Promise<vehiculo[]> {
    const where: Prisma.vehiculoWhereInput = {}
    if (filters?.estado) {
      where.estado = filters.estado
    }
    if (filters?.search) {
      where.OR = [
        { patente: { contains: filters.search } },
        { tipo_vehiculo: { contains: filters.search } },
        { marca: { contains: filters.search } },
        { modelo: { contains: filters.search } },
      ]
    }
    return await this.prisma.vehiculo.findMany({
      where,
      orderBy: { patente: 'asc' },
    })
  }

  async findAllWithUsageInRange(fechaInicio: Date, fechaFin: Date) {
    return await this.prisma.vehiculo.findMany({
      include: {
        uso_vehiculo_entrega: {
          where: {
            AND: [
              { fecha_hora_ini_uso: { lt: fechaFin } },
              { fecha_hora_ini_est: { gt: fechaInicio } },
              { entrega: { estado: { not: 'CANCELADO' } } },
            ],
          },
        },
        uso_vehiculo_visita: {
          where: {
            AND: [
              { fecha_hora_ini_uso: { lt: fechaFin } },
              { fecha_hora_fin_est: { gt: fechaInicio } },
              { visita: { estado: { not: 'CANCELADA' } } },
            ],
          },
        },
      },
    })
  }

  async findConflictingUsageForPatentes(
    patentes: string[],
    fechaInicio: Date,
    fechaFin: Date,
    excludeCodVisita?: number,
  ) {
    return await this.prisma.vehiculo.findMany({
      where: {
        patente: { in: patentes },
        OR: [
          {
            uso_vehiculo_entrega: {
              some: {
                AND: [
                  { fecha_hora_ini_uso: { lt: fechaFin } },
                  { fecha_hora_ini_est: { gt: fechaInicio } },
                  { entrega: { estado: { not: 'CANCELADO' } } },
                ],
              },
            },
          },
          {
            uso_vehiculo_visita: {
              some: {
                AND: [
                  { fecha_hora_ini_uso: { lt: fechaFin } },
                  { fecha_hora_fin_est: { gt: fechaInicio } },
                  { visita: { estado: { not: 'CANCELADA' } } },
                  ...(excludeCodVisita
                    ? [{ cod_visita: { not: excludeCodVisita } }]
                    : []),
                ],
              },
            },
          },
        ],
      },
    })
  }

  // Obtener vehiculo por patente
  async findByPatente(patente: string): Promise<vehiculo | null> {
    return await this.prisma.vehiculo.findUnique({
      where: { patente },
    })
  }

  // Crear nuevo vehiculo
  async create(data: Prisma.vehiculoCreateInput): Promise<vehiculo> {
    return await this.prisma.vehiculo.create({
      data,
    })
  }

  // Actualizar vehiculo
  async update(
    patente: string,
    data: Prisma.vehiculoUpdateInput,
  ): Promise<vehiculo> {
    return await this.prisma.vehiculo.update({
      where: { patente },
      data,
    })
  }

  // Eliminar vehiculo
  async remove(patente: string): Promise<vehiculo> {
    return await this.prisma.vehiculo.delete({
      where: { patente },
    })
  }

  // Buscar por estado
  async findByEstado(estado: string): Promise<vehiculo[]> {
    return await this.prisma.vehiculo.findMany({
      where: { estado },
      orderBy: { patente: 'asc' },
    })
  }
}

export const vehiculoRepository = new VehiculoRepository()
