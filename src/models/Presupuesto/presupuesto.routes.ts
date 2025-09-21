import { Router } from 'express'
import { PresupuestoController } from './presupuesto.controller'
import { validate } from '../../shared/middlewares/validateSchemas'
import {
  createPresupuestoSchema,
  updatePresupuestoSchema,
} from '@SIGMA-LA/schemas'

const controller = new PresupuestoController()
const router = Router()

router.get('/', (req, res) => {
  controller.getAll(req, res)
})

router.post('/', validate({ body: createPresupuestoSchema }), (req, res) => {
  controller.create(req, res)
})

router.put(
  '/:fecha_emision:cod_obra',
  validate({ body: updatePresupuestoSchema }),
  (req, res) => {
    controller.update(req, res)
  },
)

router.delete('/:fecha_emision:cod_obra', (req, res) => {
  controller.remove(req, res)
})

export default router
