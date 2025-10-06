import { Router } from 'express'
import { MaquinariaController } from './maquinaria.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { authenticateJWT } from '../Auth/auth.middleware.js'
import {
  createMaquinariaSchema,
  updateMaquinariaSchema,
  idParamsSchema,
} from 'sigma-la-schemas'

const maquinariaController = new MaquinariaController()
const maquinariaRouter = Router()

// GET /api/maquinarias/disponibles - debe ir antes de /:cod_maquina
maquinariaRouter.get('/disponibles', authenticateJWT, (req, res) => {
  maquinariaController.getDisponibles(req, res)
})

maquinariaRouter.get('/', authenticateJWT, (req, res) => {
  maquinariaController.getAll(req, res)
})

maquinariaRouter.post(
  '/',
  authenticateJWT,
  validate({ body: createMaquinariaSchema }),
  (req, res) => {
    maquinariaController.create(req, res)
  },
)

maquinariaRouter.get(
  '/:id',
  authenticateJWT,
  validate({ params: idParamsSchema }),
  (req, res) => {
    maquinariaController.getOne(req, res)
  },
)

maquinariaRouter.put(
  '/:id',
  authenticateJWT,
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
  authenticateJWT,
  validate({ params: idParamsSchema }),
  (req, res) => {
    maquinariaController.updateEstado(req, res)
  },
)

maquinariaRouter.delete(
  '/:id',
  authenticateJWT,
  validate({ params: idParamsSchema }),
  (req, res) => {
    maquinariaController.remove(req, res)
  },
)

export default maquinariaRouter
