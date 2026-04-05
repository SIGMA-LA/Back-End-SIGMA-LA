import { Router } from 'express'
import { UsoVehiculoEntregaController } from './usoVehiculoEntrega.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
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
  usoVehiculoEntregaController.create,
)

usoVehiculoEntregaRouter.get('/:cod_entrega/:patente', usoVehiculoEntregaController.getOne)

usoVehiculoEntregaRouter.put(
  '/:cod_entrega/:patente',
  validate({
    body: updateUsoVehiculoEntregaSchema,
  }),
  usoVehiculoEntregaController.update,
)

usoVehiculoEntregaRouter.delete('/:cod_entrega/:patente', usoVehiculoEntregaController.remove)


export default usoVehiculoEntregaRouter
