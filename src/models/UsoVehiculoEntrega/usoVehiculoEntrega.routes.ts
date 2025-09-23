import { Router } from 'express'
import { UsoVehiculoEntregaController } from './usoVehiculoEntrega.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createUsoVehiculoEntregaSchema,
  updateUsoVehiculoEntregaSchema,
  idParamsSchema,
} from 'sigma-la-schemas'

const usoVehiculoEntregaController = new UsoVehiculoEntregaController()
const usoVehiculoEntregaRouter = Router()

usoVehiculoEntregaRouter.get('/', (req, res) => {
  usoVehiculoEntregaController.getAll(req, res)
})

usoVehiculoEntregaRouter.post(
  '/',
  validate({ body: createUsoVehiculoEntregaSchema }),
  (req, res) => {
    usoVehiculoEntregaController.create(req, res)
  },
)

usoVehiculoEntregaRouter.get(
  '/:id',
  validate({ params: idParamsSchema }),
  (req, res) => {
    usoVehiculoEntregaController.getOne(req, res)
  },
)

usoVehiculoEntregaRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updateUsoVehiculoEntregaSchema,
  }),
  (req, res) => {
    usoVehiculoEntregaController.update(req, res)
  },
)

usoVehiculoEntregaRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  (req, res) => {
    usoVehiculoEntregaController.remove(req, res)
  },
)

export default usoVehiculoEntregaRouter
