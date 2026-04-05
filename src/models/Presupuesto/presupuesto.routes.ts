import { Router } from 'express'
import { PresupuestoController } from './presupuesto.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createPresupuestoSchema,
  updatePresupuestoSchema,
} from 'sigma-la-schemas'

const controller = new PresupuestoController()
const router = Router()

router.get('/', controller.getAll)

router.post('/', validate({ body: createPresupuestoSchema }), controller.create)

router.put(
  '/:nro_presupuesto',
  validate({ body: updatePresupuestoSchema }),
  controller.update,
)

router.delete('/:nro_presupuesto', controller.remove)


export default router
