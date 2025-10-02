import { Router } from 'express'
import { EntregaController } from './entrega.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createEntregaSchema,
  updateEntregaSchema,
  cuilParamsSchema,
} from 'sigma-la-schemas'
const entregaController = new EntregaController()
const entregaRouter = Router()

entregaRouter.get('/', (req, res) => {
  entregaController.getAll(req, res)
})

// Falta validador de los params con estado y cuil
entregaRouter.get('/:cuil_empleado/:estado', (req, res) => {
  entregaController.getEntregasByEmpleadoEstado(req, res)
})

entregaRouter.post('/', validate({ body: createEntregaSchema }), (req, res) => {
  entregaController.create(req, res)
})

entregaRouter.get(
  '/:cod_entrega',
  validate({ params: cuilParamsSchema }),
  (req, res) => {
    entregaController.getOne(req, res)
  },
)

entregaRouter.put(
  '/:cod_entrega',
  validate({
    params: cuilParamsSchema,
    body: updateEntregaSchema,
  }),
  (req, res) => {
    entregaController.update(req, res)
  },
)

entregaRouter.delete(
  '/:cod_entrega',
  validate({ params: cuilParamsSchema }),
  (req, res) => {
    entregaController.remove(req, res)
  },
)

export default entregaRouter
