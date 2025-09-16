import { Router } from 'express'
import { ObraController } from './obra.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createObraSchema,
  updateObraSchema,
} from '../../schemas/obra.schemas.js'
import { idParamsSchema } from '../../schemas/common.schema.js'

const obraController = new ObraController()
const obraRouter = Router()

obraRouter.get('/', (req, res) => {
  obraController.getAll(req, res)
})

obraRouter.post('/', validate({ body: createObraSchema }), (req, res) => {
  obraController.create(req, res)
})

obraRouter.get(
  '/:cod_obra',
  validate({ params: idParamsSchema }),
  (req, res) => {
    obraController.getOne(req, res)
  },
)

obraRouter.put(
  '/:cod_obra',
  validate({
    params: idParamsSchema,
    body: updateObraSchema,
  }),
  (req, res) => {
    obraController.update(req, res)
  },
)

obraRouter.delete(
  '/:cod_obra',
  validate({ params: idParamsSchema }),
  (req, res) => {
    obraController.remove(req, res)
  },
)

export default obraRouter
