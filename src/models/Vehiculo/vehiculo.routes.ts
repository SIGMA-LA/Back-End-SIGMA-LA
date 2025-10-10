import { Router } from 'express'
import { VehiculoController } from './vehiculo.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createVehiculoSchema,
  updateVehiculoSchema,
} from 'sigma-la-schemas'
const vehiculoController = new VehiculoController()
const vehiculoRouter = Router()

vehiculoRouter.get('/', (req, res) => {
  vehiculoController.getAll(req, res)
})

vehiculoRouter.post(
  '/',
  validate({ body: createVehiculoSchema }),
  (req, res) => {
    vehiculoController.create(req, res)
  },
)

vehiculoRouter.get(
  '/:patente',
  (req, res) => {
    vehiculoController.getOne(req, res)
  },
)

vehiculoRouter.put(
  '/:patente',
  validate({
    body: updateVehiculoSchema,
  }),
  (req, res) => {
    vehiculoController.update(req, res)
  },
)

vehiculoRouter.delete(
  '/:patente',
  (req, res) => {
    vehiculoController.remove(req, res)
  },
)

export default vehiculoRouter
