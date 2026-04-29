import { Request, Response } from 'express'
import { PedidoStockService } from './pedidoStock.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'
import type { EstadoPedidoStock } from '@prisma/client'

const pedidoStockService = new PedidoStockService()

export class PedidoStockController {
  create = catchAsync(async (req: Request, res: Response) => {
    const { obraId, descripcion } = req.body
    
    if (!obraId || !descripcion) {
      throw new AppError('Faltan campos requeridos (obraId, descripcion)', 400, 'BAD_REQUEST')
    }

    // Determine initial state based on user role
    const rol = req.user?.rol_actual
    const estadoInicial: EstadoPedidoStock = rol === 'COORDINACION' ? 'PEDIDO' : 'PENDIENTE'

    const pedido = await pedidoStockService.create({
      obraId: Number(obraId),
      descripcion,
      estadoInicial
    })

    return sendSuccess(res, pedido, 'Pedido de stock creado exitosamente', 201)
  })

  getAll = catchAsync(async (req: Request, res: Response) => {
    const pedidos = await pedidoStockService.findAll()
    return sendSuccess(res, pedidos)
  })

  updateEstado = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const { estado } = req.body

    if (!estado) {
      throw new AppError('El campo estado es requerido', 400, 'BAD_REQUEST')
    }

    const validEstados: EstadoPedidoStock[] = ['PENDIENTE', 'APROBADO', 'PEDIDO', 'RECIBIDO']
    if (!validEstados.includes(estado as EstadoPedidoStock)) {
      throw new AppError('Estado inválido', 400, 'INVALID_STATE')
    }

    const pedido = await pedidoStockService.updateEstado(id, estado as EstadoPedidoStock)
    return sendSuccess(res, pedido, 'Estado del pedido actualizado')
  })
}
