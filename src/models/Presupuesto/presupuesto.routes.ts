import { Router } from 'express'
import { PresupuestoController } from './presupuesto.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'
import {
  createPresupuestoSchema,
  updatePresupuestoSchema,
} from 'sigma-la-schemas'

const controller = new PresupuestoController()
const router = Router()

router.get('/', authorize('presupuesto', 'obtener'), controller.getAll)

router.post('/', validate({ body: createPresupuestoSchema }), authorize('presupuesto', 'crear'), controller.create)

router.put(
  '/:nro_presupuesto',
  validate({ body: updatePresupuestoSchema }),
  authorize('presupuesto', 'actualizar'),
  controller.update,
)

router.delete('/:nro_presupuesto', authorize('presupuesto', 'eliminar'), controller.remove)


export default router
