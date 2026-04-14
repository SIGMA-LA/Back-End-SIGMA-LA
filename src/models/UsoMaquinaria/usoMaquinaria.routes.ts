import { Router } from 'express'
import { UsoMaquinariaController } from './usoMaquinaria.controller.js'
import {
  createUsoMaquinariaSchema,
  updateUsoMaquinariaSchema,
  idParamsSchema,
} from 'sigma-la-schemas'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'

const controller = new UsoMaquinariaController()
const usoMaquinariaRouter = Router()

usoMaquinariaRouter.get('/', controller.getAll)

usoMaquinariaRouter.post(
  '/',
  validate({ body: createUsoMaquinariaSchema }),
  authorize('usoMaquinaria', 'crear'),
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
  authorize('usoMaquinaria', 'actualizar'),
  controller.update,
)

usoMaquinariaRouter.delete(
  '/:cod_maquina/:cod_entrega',
  validate({ params: idParamsSchema }),
  authorize('usoMaquinaria', 'eliminar'),
  controller.remove,
)


export default usoMaquinariaRouter
