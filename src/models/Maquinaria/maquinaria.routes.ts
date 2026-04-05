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
maquinariaRouter.get('/disponibles', maquinariaController.getDisponibles)

maquinariaRouter.get('/', maquinariaController.getAll)

maquinariaRouter.get('/disponibilidad', maquinariaController.getDisponibilidadPorFecha)

maquinariaRouter.post(
  '/',
  validate({ body: createMaquinariaSchema }),
  maquinariaController.create,
)

maquinariaRouter.get(
  '/:id',
  validate({ params: idParamsSchema }),
  maquinariaController.getOne,
)

maquinariaRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updateMaquinariaSchema,
  }),
  maquinariaController.update,
)

// PATCH /api/maquinarias/:id/estado
maquinariaRouter.patch(
  '/:id/estado',
  validate({ params: idParamsSchema }),
  maquinariaController.updateEstado,
)

maquinariaRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  maquinariaController.remove,
)


export default maquinariaRouter
