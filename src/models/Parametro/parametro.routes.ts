import { Router } from 'express'
import { ParametroController } from './parametro.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createParametroSchema,
  updateParametroSchema,
} from '../../schemas/parametro.schema.js'

const parametroController = new ParametroController()
const parametroRouter = Router()

parametroRouter.get('/', (req, res) => {
  parametroController.getAll(req, res)
})

parametroRouter.post(
  '/',
  validate({ body: createParametroSchema }),
  (req, res) => {
    parametroController.create(req, res)
  },
)

parametroRouter.get('/:fecha/:hora', (req, res) => {
  parametroController.getOne(req, res)
})

parametroRouter.put(
  '/:fecha/:hora',
  validate({ body: updateParametroSchema }),
  (req, res) => {
    parametroController.update(req, res)
  },
)

parametroRouter.delete('/:fecha/:hora', (req, res) => {
  parametroController.remove(req, res)
})

export default parametroRouter
