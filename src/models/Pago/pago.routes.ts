import { Router } from 'express'
import { PagoController } from './pago.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'
import {
  createPagoSchema,
  updatePagoSchema,
  idParamsSchema,
} from 'sigma-la-schemas'

const pagoController = new PagoController()
const pagoRouter = Router()

pagoRouter.get('/', authorize('pago', 'obtener'), pagoController.getAll)

pagoRouter.get('/stats/facturacion', authorize('pago', 'facturacion'), pagoController.getFacturacionStats)

pagoRouter.post('/', validate({ body: createPagoSchema }), authorize('pago', 'crear'), pagoController.create)

pagoRouter.post('/obra/:cod_obra', authorize('pago', 'crear'), pagoController.createForObra)

pagoRouter.get('/obra/:cod_obra', authorize('pago', 'obtener'), pagoController.getByObra)

pagoRouter.get('/:id', validate({ params: idParamsSchema }), authorize('pago', 'obtener'), pagoController.getOne)

pagoRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updatePagoSchema,
  }),
  authorize('pago', 'actualizar'),
  pagoController.update,
)

pagoRouter.delete('/:id', validate({ params: idParamsSchema }), authorize('pago', 'eliminar'), pagoController.remove)

export default pagoRouter
