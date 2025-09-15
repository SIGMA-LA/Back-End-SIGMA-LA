import { PrismaClient, presupuesto, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class PresupuestoRepository {
  private prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  // Obtener todos los empleados
  async findAll(): Promise<presupuesto[]> {
    return await this.prisma.presupuesto.findMany({
      orderBy: { fecha_emision: 'asc' },
    })
  }

  // Obtener presupuesto por fecha y hora de cambio
  async findById(
    fecha_emision: Date,
    cod_obra: number,
  ): Promise<presupuesto | null> {
    return await this.prisma.presupuesto.findUnique({
      where: {
        fecha_emision_cod_obra: {
          fecha_emision,
          cod_obra,
        },
      },
    })
  }

  // Crear nuevo presupuesto
  async create(data: Prisma.presupuestoCreateInput): Promise<presupuesto> {
    return await this.prisma.presupuesto.create({
      data,
    })
  }

  // Actualizar presupuesto
  async update(
    fecha_emision: Date,
    cod_obra: number,
    data: Prisma.presupuestoUpdateInput,
  ): Promise<presupuesto> {
    return await this.prisma.presupuesto.update({
      where: {
        fecha_emision_cod_obra: {
          fecha_emision,
          cod_obra,
        },
      },
      data,
    })
  }

  // Eliminar presupuesto
  async delete(fecha_emision: Date, cod_obra: number): Promise<presupuesto> {
    return await this.prisma.presupuesto.delete({
      where: {
        fecha_emision_cod_obra: {
          fecha_emision,
          cod_obra,
        },
      },
    })
  }
}
