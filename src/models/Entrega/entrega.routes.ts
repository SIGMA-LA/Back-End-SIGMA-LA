import { Router } from 'express'
import { EntregaController } from './entrega.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createEntregaSchema,
  updateEntregaSchema,
  idParamsSchema,
} from 'sigma-la-schemas'
const entregaController = new EntregaController()
const entregaRouter = Router()

entregaRouter.get('/', (req, res) => {
  entregaController.getAll(req, res)
})

entregaRouter.get('/:cuil_empleado/:estado', (req, res) => {
  entregaController.getEntregasByEmpleadoEstado(req, res)
})

entregaRouter.post('/', validate({ body: createEntregaSchema }), (req, res) => {
  entregaController.create(req, res)
})

entregaRouter.get('/:id', validate({ params: idParamsSchema }), (req, res) => {
  entregaController.getOne(req, res)
})

entregaRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updateEntregaSchema,
  }),
  (req, res) => {
    entregaController.update(req, res)
  },
)

entregaRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  (req, res) => {
    entregaController.remove(req, res)
  },
)

entregaRouter.patch('/:id/finalizar', (req, res) => {
  entregaController.finalizarEntrega(req, res)
})

entregaRouter.patch('/:id/cancelar', (req, res) => {
  entregaController.cancelarEntrega(req, res)
})

export default entregaRouter
