import { Router } from 'express'
import { LocalidadController } from './localidad.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { updateLocalidadSchema, idParamsSchema } from 'sigma-la-schemas'

const localidadController = new LocalidadController()
const localidadRouter = Router()

localidadRouter.get('/provincias/:provinciaId', (req, res) => {
  const provinciaId = parseInt(req.params.provinciaId, 10)
  localidadController.getByProvincia(provinciaId, req, res)
})

localidadRouter.get('/', (req, res) => {
  localidadController.getAll(req, res)
})

localidadRouter.post('/', (req, res) => {
  localidadController.create(req, res)
})

localidadRouter.get(
  '/:id',
  validate({ params: idParamsSchema }),
  (req, res) => {
    localidadController.getOne(req, res)
  },
)

localidadRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updateLocalidadSchema,
  }),
  (req, res) => {
    localidadController.update(req, res)
  },
)

localidadRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  (req, res) => {
    localidadController.remove(req, res)
  },
)

export default localidadRouter
