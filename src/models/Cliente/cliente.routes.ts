import { Router } from 'express'
import { ClienteController } from './cliente.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createClienteSchema,
  updateClienteSchema,
  cuilParamsSchema,
} from '@SIGMA-LA/schemas'

const clienteController = new ClienteController()
const clienteRouter = Router()

clienteRouter.get('/', (req, res) => {
  clienteController.getAll(req, res)
})

clienteRouter.post('/', validate({ body: createClienteSchema }), (req, res) => {
  clienteController.create(req, res)
})

clienteRouter.get(
  '/:cuil',
  validate({ params: cuilParamsSchema }),
  (req, res) => {
    clienteController.getOne(req, res)
  },
)

clienteRouter.put(
  '/:cuil',
  validate({
    params: cuilParamsSchema,
    body: updateClienteSchema,
  }),
  (req, res) => {
    clienteController.update(req, res)
  },
)

clienteRouter.delete(
  '/:cuil',
  validate({ params: cuilParamsSchema }),
  (req, res) => {
    clienteController.remove(req, res)
  },
)

export default clienteRouter
