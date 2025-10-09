import { PrismaClient, pago, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class PagoRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async createForObra(data: Prisma.pagoUncheckedCreateInput): Promise<pago> {
    return await this.prisma.pago.create({ data })
  }

  async createOne(data: Prisma.pagoCreateInput): Promise<pago> {
    return await this.prisma.pago.create({ data })
  }
  async findAll(): Promise<pago[]> {
    return await this.prisma.pago.findMany({
      orderBy: { fecha_pago: 'desc' },
      include: {
        obra: {
          include: {
            cliente: {
              select: {
                razon_social: true,
              },
            },
          },
        },
      },
    })
  }

  async findById(cod_pago: number): Promise<pago | null> {
    return await this.prisma.pago.findUnique({
      where: { cod_pago },
    })
  }

  async update(cod_pago: number, data: Prisma.pagoUpdateInput): Promise<pago> {
    return await this.prisma.pago.update({
      where: { cod_pago },
      data,
    })
  }

  async delete(cod_pago: number): Promise<pago> {
    return await this.prisma.pago.delete({
      where: { cod_pago },
    })
  }

  async findManyByObra(cod_obra: number): Promise<pago[]> {
    return await this.prisma.pago.findMany({
      where: { cod_obra },
      orderBy: { fecha_pago: 'desc' },
    })
  }
}
