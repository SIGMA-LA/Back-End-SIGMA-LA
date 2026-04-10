import { Router } from 'express'
import { UsoVehiculoVisitaController } from './usoVehiculoVisita.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'
import {
  createUsoVehiculoVisitaSchema,
  updateUsoVehiculoVisitaSchema,
} from 'sigma-la-schemas'

const usoVehiculoVisitaController = new UsoVehiculoVisitaController()
const usoVehiculoVisitaRouter = Router()

usoVehiculoVisitaRouter.get('/', usoVehiculoVisitaController.getAll)

usoVehiculoVisitaRouter.post(
  '/',
  validate({ body: createUsoVehiculoVisitaSchema }),
  authorize('usoVehiculoVisita', 'crear'),
  usoVehiculoVisitaController.create,
)

usoVehiculoVisitaRouter.get('/:cod_visita/:patente', usoVehiculoVisitaController.getOne)

usoVehiculoVisitaRouter.put(
  '/:cod_visita/:patente',
  validate({
    body: updateUsoVehiculoVisitaSchema,
  }),
  authorize('usoVehiculoVisita', 'actualizar'),
  usoVehiculoVisitaController.update,
)

usoVehiculoVisitaRouter.delete('/:cod_visita/:patente', authorize('usoVehiculoVisita', 'eliminar'), usoVehiculoVisitaController.remove)


export default usoVehiculoVisitaRouter
