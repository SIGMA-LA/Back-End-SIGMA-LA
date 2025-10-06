import { Router } from 'express'
import { EmpleadoController } from './empleado.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createEmpleadoSchema,
  updateEmpleadoSchema,
  cuilParamsSchema,
} from 'sigma-la-schemas'
import { authenticateJWT } from '../Auth/auth.middleware.js'

const empleadoController = new EmpleadoController()
const empleadoRouter = Router()

empleadoRouter.get('/', (req, res) => {
  empleadoController.getAll(req, res)
})

empleadoRouter.get('/me', authenticateJWT, (req, res) => {
  empleadoController.getMe(req, res)
})

  empleadoRouter.get('/disponibles-entrega', (req, res) => {
  empleadoController.getDisponiblesParaEntrega(req, res)
})

empleadoRouter.post(
  '/',
  validate({ body: createEmpleadoSchema }),
  (req, res) => {
    empleadoController.create(req, res)
  },
)

empleadoRouter.get(
  '/:cuil',
  validate({ params: cuilParamsSchema }),
  (req, res) => {
    empleadoController.getOne(req, res)
  },
)

empleadoRouter.put(
  '/:cuil',
  validate({
    params: cuilParamsSchema,
    body: updateEmpleadoSchema,
  }),
  (req, res) => {
    empleadoController.update(req, res)
  },
)

empleadoRouter.delete(
  '/:cuil',
  validate({ params: cuilParamsSchema }),
  (req, res) => {
    empleadoController.remove(req, res)
  },
)

export default empleadoRouter
