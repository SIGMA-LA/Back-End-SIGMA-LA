import { Router } from 'express'
import { MaquinariaController } from './maquinaria.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createMaquinariaSchema,
  updateMaquinariaSchema,
  idParamsSchema,
} from 'sigma-la-schemas'

const maquinariaController = new MaquinariaController()
const maquinariaRouter = Router()

// GET /api/maquinarias/disponibles - debe ir antes de /:cod_maquina
maquinariaRouter.get('/disponibles', (req, res) => {
  maquinariaController.getDisponibles(req, res)
})

maquinariaRouter.get('/', (req, res) => {
  maquinariaController.getAll(req, res)
})

maquinariaRouter.get('/disponibilidad', (req, res) => {
  maquinariaController.getDisponibilidadPorFecha(req, res)
})

maquinariaRouter.post(
  '/',
  validate({ body: createMaquinariaSchema }),
  (req, res) => {
    maquinariaController.create(req, res)
  },
)

maquinariaRouter.get(
  '/:id',
  validate({ params: idParamsSchema }),
  (req, res) => {
    maquinariaController.getOne(req, res)
  },
)

maquinariaRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updateMaquinariaSchema,
  }),
  (req, res) => {
    maquinariaController.update(req, res)
  },
)

// PATCH /api/maquinarias/:id/estado
maquinariaRouter.patch(
  '/:id/estado',
  validate({ params: idParamsSchema }),
  (req, res) => {
    maquinariaController.updateEstado(req, res)
  },
)

maquinariaRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  (req, res) => {
    maquinariaController.remove(req, res)
  },
)

export default maquinariaRouter
