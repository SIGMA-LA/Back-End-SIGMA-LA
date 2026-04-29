import { prisma } from '../../shared/db/prismaClient.js'
import type { Prisma, pedido_stock } from '@prisma/client'

export class PedidoStockRepository {
  async create(data: Prisma.pedido_stockCreateInput): Promise<pedido_stock> {
    return prisma.pedido_stock.create({
      data,
      include: {
        obra: {
          include: {
            localidad: true,
            cliente: true,
          },
        },
      },
    })
  }

  async findAll(): Promise<pedido_stock[]> {
    return prisma.pedido_stock.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        obra: {
          include: {
            localidad: true,
            cliente: true,
          },
        },
      },
    })
  }

  async findById(id: string): Promise<pedido_stock | null> {
    return prisma.pedido_stock.findUnique({
      where: { id },
      include: {
        obra: {
          include: {
            localidad: true,
            cliente: true,
          },
        },
      },
    })
  }

  async update(id: string, data: Prisma.pedido_stockUpdateInput): Promise<pedido_stock> {
    return prisma.pedido_stock.update({
      where: { id },
      data,
      include: {
        obra: {
          include: {
            localidad: true,
            cliente: true,
          },
        },
      },
    })
  }

  async delete(id: string): Promise<pedido_stock> {
    return prisma.pedido_stock.delete({
      where: { id },
    })
  }
}
