import { Router } from 'express'
import { OrdenProduccionController } from './ordenProduccion.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createOrdenProduccionSchema,
  updateOrdenProduccionSchema,
  idParamsSchema,
} from 'sigma-la-schemas'

const ordenProduccionController = new OrdenProduccionController()
const ordenProduccionRouter = Router()

ordenProduccionRouter.get('/', (req, res) => {
  ordenProduccionController.getAll(req, res)
})

ordenProduccionRouter.post(
  '/',
  validate({ body: createOrdenProduccionSchema }),
  (req, res) => {
    ordenProduccionController.create(req, res)
  },
)

ordenProduccionRouter.get(
  '/:cod_orden',
  validate({ params: idParamsSchema }),
  (req, res) => {
    ordenProduccionController.getOne(req, res)
  },
)

ordenProduccionRouter.put(
  '/:cod_orden',
  validate({
    params: idParamsSchema,
    body: updateOrdenProduccionSchema,
  }),
  (req, res) => {
    ordenProduccionController.update(req, res)
  },
)

ordenProduccionRouter.delete(
  '/:cod_orden',
  validate({ params: idParamsSchema }),
  (req, res) => {
    ordenProduccionController.remove(req, res)
  },
)

export default ordenProduccionRouter
