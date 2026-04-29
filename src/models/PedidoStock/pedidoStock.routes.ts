import { Router } from 'express'
import { PedidoStockController } from './pedidoStock.controller.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'

const pedidoStockController = new PedidoStockController()
const pedidoStockRouter = Router()

pedidoStockRouter.get('/', authorize('pedidoStock', 'obtener'), pedidoStockController.getAll)
pedidoStockRouter.post('/', authorize('pedidoStock', 'crear'), pedidoStockController.create)
pedidoStockRouter.patch('/:id/estado', authorize('pedidoStock', 'actualizarEstado'), pedidoStockController.updateEstado)

export default pedidoStockRouter
