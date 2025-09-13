import { Router } from 'express'
import { MaquinariaController } from './maquinaria.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createMaquinariaSchema,
  updateMaquinariaSchema,
} from '../../schemas/maquinaria.schema.js'
import { idParamsSchema } from '../../schemas/common.schema.js'

const maquinariaController = new MaquinariaController()
const maquinariaRouter = Router()

maquinariaRouter.get('/', (req, res) => {
  maquinariaController.getAll(req, res)
})

maquinariaRouter.post(
  '/',
  validate({ body: createMaquinariaSchema }),
  (req, res) => {
    maquinariaController.create(req, res)
  },
)

maquinariaRouter.get(
  '/:cod_maquina',
  validate({ params: idParamsSchema }),
  (req, res) => {
    maquinariaController.getOne(req, res)
  },
)

maquinariaRouter.put(
  '/:cod_maquina',
  validate({
    params: idParamsSchema,
    body: updateMaquinariaSchema,
  }),
  (req, res) => {
    maquinariaController.update(req, res)
  },
)

maquinariaRouter.delete(
  '/:cod_maquina',
  validate({ params: idParamsSchema }),
  (req, res) => {
    maquinariaController.remove(req, res)
  },
)

export default maquinariaRouter
