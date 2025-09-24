import { Router } from 'express'
import { PresupuestoController } from './presupuesto.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createPresupuestoSchema,
  updatePresupuestoSchema,
} from 'sigma-la-schemas'

const controller = new PresupuestoController()
const router = Router()

router.get('/', (req, res) => {
  controller.getAll(req, res)
})

router.post('/', validate({ body: createPresupuestoSchema }), (req, res) => {
  controller.create(req, res)
})

router.put(
  '/:nro_presupuesto',
  validate({ body: updatePresupuestoSchema }),
  (req, res) => {
    controller.update(req, res)
  },
)

router.delete('/:nro_presupuesto', (req, res) => {
  controller.remove(req, res)
})

export default router
