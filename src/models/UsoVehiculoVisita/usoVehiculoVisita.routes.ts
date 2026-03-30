import { Router } from 'express'
import { UsoVehiculoVisitaController } from './usoVehiculoVisita.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createUsoVehiculoVisitaSchema,
  updateUsoVehiculoVisitaSchema,
} from 'sigma-la-schemas'

const usoVehiculoVisitaController = new UsoVehiculoVisitaController()
const usoVehiculoVisitaRouter = Router()

usoVehiculoVisitaRouter.get('/', (req, res) => {
  usoVehiculoVisitaController.getAll(req, res)
})

usoVehiculoVisitaRouter.post(
  '/',
  validate({ body: createUsoVehiculoVisitaSchema }),
  (req, res) => {
    usoVehiculoVisitaController.create(req, res)
  },
)

usoVehiculoVisitaRouter.get('/:cod_visita/:patente', (req, res) => {
  usoVehiculoVisitaController.getOne(req, res)
})

usoVehiculoVisitaRouter.put(
  '/:cod_visita/:patente',
  validate({
    body: updateUsoVehiculoVisitaSchema,
  }),
  (req, res) => {
    usoVehiculoVisitaController.update(req, res)
  },
)

usoVehiculoVisitaRouter.delete('/:cod_visita/:patente', (req, res) => {
  usoVehiculoVisitaController.remove(req, res)
})

export default usoVehiculoVisitaRouter
