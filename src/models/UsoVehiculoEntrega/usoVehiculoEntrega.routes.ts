import { Router } from 'express'
import { UsoVehiculoEntregaController } from './usoVehiculoEntrega.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createUsoVehiculoEntregaSchema,
  updateUsoVehiculoEntregaSchema,
} from 'sigma-la-schemas'

const usoVehiculoEntregaController = new UsoVehiculoEntregaController()
const usoVehiculoEntregaRouter = Router()

usoVehiculoEntregaRouter.get('/', (req, res) => {
  usoVehiculoEntregaController.getAll(req, res)
})

usoVehiculoEntregaRouter.post(
  '/',
  validate({ body: createUsoVehiculoEntregaSchema }),
  (req, res) => {
    usoVehiculoEntregaController.create(req, res)
  },
)

usoVehiculoEntregaRouter.get('/:cod_entrega/:cod_vehiculo', (req, res) => {
  usoVehiculoEntregaController.getOne(req, res)
})

usoVehiculoEntregaRouter.put(
  '/:cod_entrega/:cod_vehiculo',
  validate({
    body: updateUsoVehiculoEntregaSchema,
  }),
  (req, res) => {
    usoVehiculoEntregaController.update(req, res)
  },
)

usoVehiculoEntregaRouter.delete('/:cod_entrega/:cod_vehiculo', (req, res) => {
  usoVehiculoEntregaController.remove(req, res)
})

export default usoVehiculoEntregaRouter
