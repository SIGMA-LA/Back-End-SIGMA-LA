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

pagoRouter.post('/obra/:cod_obra', (req, res) => {
  pagoController.createForObra(req, res)
})

pagoRouter.get('/obra/:cod_obra', (req, res) => {
  pagoController.getByObra(req, res)
})

pagoRouter.get('/:id', validate({ params: idParamsSchema }), (req, res) => {
  pagoController.getOne(req, res)
})

pagoRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updatePagoSchema,
  }),
  (req, res) => {
    pagoController.update(req, res)
  },
)

pagoRouter.delete('/:id', validate({ params: idParamsSchema }), (req, res) => {
  pagoController.remove(req, res)
})

export default pagoRouter
