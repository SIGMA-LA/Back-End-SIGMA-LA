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

pagoRouter.get('/', (req, res) => {
  pagoController.getAll(req, res)
})

pagoRouter.post('/', validate({ body: createPagoSchema }), (req, res) => {
  pagoController.create(req, res)
})

pagoRouter.get(
  '/:cod_pago',
  validate({ params: idParamsSchema }),
  (req, res) => {
    pagoController.getOne(req, res)
  },
)

pagoRouter.put(
  '/:cod_pago',
  validate({
    params: idParamsSchema,
    body: updatePagoSchema,
  }),
  (req, res) => {
    pagoController.update(req, res)
  },
)

pagoRouter.delete(
  '/:cod_pago',
  validate({ params: idParamsSchema }),
  (req, res) => {
    pagoController.remove(req, res)
  },
)

export default pagoRouter
