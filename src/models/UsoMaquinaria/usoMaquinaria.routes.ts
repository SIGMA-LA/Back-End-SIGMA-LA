import { Router } from 'express'
import { UsoMaquinariaController } from './usoMaquinaria.controller.js'
import {
  createUsoMaquinariaSchema,
  updateUsoMaquinariaSchema,
  idParamsSchema,
} from 'sigma-la-schemas'
import { validate } from '../../shared/middlewares/validateSchemas.js'

const controller = new UsoMaquinariaController()
const usoMaquinariaRouter = Router()

usoMaquinariaRouter.get('/', (req, res) => {
  controller.getAll(req, res)
})

usoMaquinariaRouter.post(
  '/',
  validate({ body: createUsoMaquinariaSchema }),
  (req, res) => {
    controller.create(req, res)
  },
)

usoMaquinariaRouter.get(
  '/:cod_maquina/:cod_entrega',
  validate({ params: idParamsSchema }),
  (req, res) => {
    controller.getOne(req, res)
  },
)

usoMaquinariaRouter.put(
  '/:cod_maquina/:cod_entrega',
  validate({
    params: idParamsSchema,
    body: updateUsoMaquinariaSchema,
  }),
  (req, res) => {
    controller.update(req, res)
  },
)

usoMaquinariaRouter.delete(
  '/:cod_maquina/:cod_entrega',
  validate({ params: idParamsSchema }),
  (req, res) => {
    controller.remove(req, res)
  },
)

export default usoMaquinariaRouter
