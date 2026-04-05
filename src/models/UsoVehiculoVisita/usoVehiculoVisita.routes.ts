import { Router } from 'express'
import { UsoVehiculoVisitaController } from './usoVehiculoVisita.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
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
  usoVehiculoVisitaController.create,
)

usoVehiculoVisitaRouter.get('/:cod_visita/:patente', usoVehiculoVisitaController.getOne)

usoVehiculoVisitaRouter.put(
  '/:cod_visita/:patente',
  validate({
    body: updateUsoVehiculoVisitaSchema,
  }),
  usoVehiculoVisitaController.update,
)

usoVehiculoVisitaRouter.delete('/:cod_visita/:patente', usoVehiculoVisitaController.remove)


export default usoVehiculoVisitaRouter
