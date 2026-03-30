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

  // Obtener presupuesto por nro_presupuesto
  async findById(nro_presupuesto: number): Promise<presupuesto | null> {
    return await this.prisma.presupuesto.findUnique({
      where: {
        nro_presupuesto,
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
    nro_presupuesto: number,
    data: Prisma.presupuestoUpdateInput,
  ): Promise<presupuesto> {
    return await this.prisma.presupuesto.update({
      where: {
        nro_presupuesto,
      },
      data,
    })
  }

  // Eliminar presupuesto
  async delete(nro_presupuesto: number): Promise<presupuesto> {
    return await this.prisma.presupuesto.delete({
      where: {
        nro_presupuesto,
      },
    })
  }
}
