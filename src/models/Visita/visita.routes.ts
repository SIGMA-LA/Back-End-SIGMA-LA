import { Router } from 'express'
import { VisitaController } from './visita.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createVisitaSchema,
  updateVisitaSchema,
} from '../../schemas/visita.schema.js'
import { idParamsSchema } from '../../schemas/common.schema.js'

const visitaController = new VisitaController()
const visitaRouter = Router()

visitaRouter.get('/', (req, res) => {
  visitaController.getAll(req, res)
})

visitaRouter.post('/', validate({ body: createVisitaSchema }), (req, res) => {
  visitaController.create(req, res)
})

visitaRouter.get('/:id', validate({ params: idParamsSchema }), (req, res) => {
  visitaController.getOne(req, res)
})

visitaRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updateVisitaSchema,
  }),
  (req, res) => {
    visitaController.update(req, res)
  },
)

visitaRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  (req, res) => {
    visitaController.remove(req, res)
  },
)

export default visitaRouter
