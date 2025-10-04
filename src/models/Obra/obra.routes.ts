import { Router } from 'express'
import { ObraController } from './obra.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createObraSchema,
  updateObraSchema,
  idParamsSchema,
} from 'sigma-la-schemas'

const obraController = new ObraController()
const obraRouter = Router()

obraRouter.get('/', (req, res) => {
  obraController.getAll(req, res)
})

obraRouter.get('/notas-sin-orden', (req, res) => {
  obraController.getObrasConNotaSinOrden(req, res)
})

obraRouter.post('/', validate({ body: createObraSchema }), (req, res) => {
  obraController.create(req, res)
})

obraRouter.get('/:id', validate({ params: idParamsSchema }), (req, res) => {
  obraController.getOne(req, res)
})

obraRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updateObraSchema,
  }),
  (req, res) => {
    obraController.update(req, res)
  },
)

obraRouter.delete('/:id', (req, res) => {
  validate({ params: idParamsSchema })(req, res, () => {})
  obraController.remove(req, res)
})

export default obraRouter
