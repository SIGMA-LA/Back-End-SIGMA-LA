import { PedidoStockRepository } from './pedidoStock.repository.js'
import { AppError } from '../../shared/errors/AppError.js'
import { ValidationError } from '../../shared/errors/validationError.js'
import { prisma } from '../../shared/db/prismaClient.js'
import { eventBus } from '../../shared/events/eventBus.js'
import type { pedido_stock, EstadoPedidoStock } from '@prisma/client'
import crypto from 'crypto'

export interface CreatePedidoStockDTO {
  obraId: number
  descripcion: string
  estadoInicial: EstadoPedidoStock
}

export class PedidoStockService {
  private repository: PedidoStockRepository

  constructor() {
    this.repository = new PedidoStockRepository()
  }

  async create(data: CreatePedidoStockDTO): Promise<pedido_stock> {
    const obra = await prisma.obra.findUnique({ where: { cod_obra: data.obraId } })
    
    if (!obra) {
      throw new AppError('La obra especificada no existe.', 404, 'OBRA_NOT_FOUND')
    }

    if (obra.estado !== 'PAGADA PARCIALMENTE') {
      throw new ValidationError(
        'Solo se puede solicitar stock para obras con pago parcial.',
        'INVALID_STATE'
      )
    }

    const existingPedido = await prisma.pedido_stock.findUnique({
      where: { obraId: data.obraId }
    })

    if (existingPedido) {
      throw new ValidationError(
        'Esta obra ya tiene un pedido de stock asociado.',
        'ALREADY_EXISTS'
      )
    }

    const id = crypto.randomUUID()

    const pedido = await this.repository.create({
      id,
      descripcion: data.descripcion,
      estado: data.estadoInicial,
      updatedAt: new Date(),
      obra: {
        connect: { cod_obra: data.obraId }
      }
    })

    const updatedObra = await prisma.obra.update({
      where: { cod_obra: data.obraId },
      data: { estado: 'EN ESPERA DE STOCK' }
    })

    eventBus.emit('obra.cambio_estado', { cod_obra: data.obraId, nuevo_estado: updatedObra.estado })

    return pedido
  }

  async findAll(): Promise<pedido_stock[]> {
    return this.repository.findAll()
  }

  async updateEstado(id: string, nuevoEstado: EstadoPedidoStock): Promise<pedido_stock> {
    const pedido = await this.repository.findById(id)
    if (!pedido) {
      throw new AppError('Pedido de stock no encontrado', 404, 'NOT_FOUND')
    }

    const updatedPedido = await this.repository.update(id, {
      estado: nuevoEstado,
      updatedAt: new Date()
    })

    if (nuevoEstado === 'RECIBIDO') {
      const updatedObra = await prisma.obra.update({
        where: { cod_obra: pedido.obraId },
        data: { estado: 'PAGADA PARCIALMENTE' }
      })
      eventBus.emit('obra.cambio_estado', { cod_obra: pedido.obraId, nuevo_estado: updatedObra.estado })
    }

    return updatedPedido
  }
}
