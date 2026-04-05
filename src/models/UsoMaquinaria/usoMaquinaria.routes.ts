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

usoMaquinariaRouter.get('/', controller.getAll)

usoMaquinariaRouter.post(
  '/',
  validate({ body: createUsoMaquinariaSchema }),
  controller.create,
)

usoMaquinariaRouter.get(
  '/:cod_maquina/:cod_entrega',
  validate({ params: idParamsSchema }),
  controller.getOne,
)

usoMaquinariaRouter.put(
  '/:cod_maquina/:cod_entrega',
  validate({
    params: idParamsSchema,
    body: updateUsoMaquinariaSchema,
  }),
  controller.update,
)

usoMaquinariaRouter.delete(
  '/:cod_maquina/:cod_entrega',
  validate({ params: idParamsSchema }),
  controller.remove,
)


export default usoMaquinariaRouter
