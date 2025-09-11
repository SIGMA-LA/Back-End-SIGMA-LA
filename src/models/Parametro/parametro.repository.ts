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
  async findByFecha(
    fecha_cambio: Date,
    hora_cambio: Date,
  ): Promise<parametro | null> {
    return await this.prisma.parametro.findUnique({
      where: {
        fecha_cambio_hora_cambio: {
          fecha_cambio,
          hora_cambio,
        },
      },
    })
  }

  // Crear nuevo parametro
  async create(data: Prisma.parametroCreateInput): Promise<parametro> {
    return await this.prisma.parametro.create({
      data,
    })
  }

  // Actualizar parametro
  async update(
    fecha_cambio: Date,
    hora_cambio: Date,
    data: Prisma.parametroUpdateInput,
  ): Promise<parametro> {
    return await this.prisma.parametro.update({
      where: {
        fecha_cambio_hora_cambio: {
          fecha_cambio,
          hora_cambio,
        },
      },
      data,
    })
  }

  // Eliminar parametro
  async delete(fecha_cambio: Date, hora_cambio: Date): Promise<parametro> {
    return await this.prisma.parametro.delete({
      where: {
        fecha_cambio_hora_cambio: {
          fecha_cambio,
          hora_cambio,
        },
      },
    })
  }

  // Contar total de parametros
  async count(): Promise<number> {
    return await this.prisma.localidad.count()
  }
}
