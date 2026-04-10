import { Router } from 'express'
import { UsoVehiculoEntregaController } from './usoVehiculoEntrega.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'
import {
  createUsoVehiculoEntregaSchema,
  updateUsoVehiculoEntregaSchema,
} from 'sigma-la-schemas'

const usoVehiculoEntregaController = new UsoVehiculoEntregaController()
const usoVehiculoEntregaRouter = Router()

usoVehiculoEntregaRouter.get('/', usoVehiculoEntregaController.getAll)

usoVehiculoEntregaRouter.post(
  '/',
  validate({ body: createUsoVehiculoEntregaSchema }),
  authorize('usoVehiculoEntrega', 'crear'),
  usoVehiculoEntregaController.create,
)

usoVehiculoEntregaRouter.get('/:cod_entrega/:patente', usoVehiculoEntregaController.getOne)

usoVehiculoEntregaRouter.put(
  '/:cod_entrega/:patente',
  validate({
    body: updateUsoVehiculoEntregaSchema,
  }),
  authorize('usoVehiculoEntrega', 'actualizar'),
  usoVehiculoEntregaController.update,
)

usoVehiculoEntregaRouter.delete('/:cod_entrega/:patente', authorize('usoVehiculoEntrega', 'eliminar'), usoVehiculoEntregaController.remove)


export default usoVehiculoEntregaRouter
