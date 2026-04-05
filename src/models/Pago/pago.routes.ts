import { Router } from 'express'
import { PagoController } from './pago.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createPagoSchema,
  updatePagoSchema,
  idParamsSchema,
} from 'sigma-la-schemas'

const pagoController = new PagoController()
const pagoRouter = Router()

pagoRouter.get('/', pagoController.getAll)

pagoRouter.post('/', validate({ body: createPagoSchema }), pagoController.create)

pagoRouter.post('/obra/:cod_obra', pagoController.createForObra)

pagoRouter.get('/obra/:cod_obra', pagoController.getByObra)

pagoRouter.get('/:id', validate({ params: idParamsSchema }), pagoController.getOne)

pagoRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updatePagoSchema,
  }),
  pagoController.update,
)

pagoRouter.delete('/:id', validate({ params: idParamsSchema }), pagoController.remove)

export default pagoRouter
