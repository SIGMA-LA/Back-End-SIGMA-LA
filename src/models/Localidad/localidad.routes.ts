import { Router } from 'express'
import { LocalidadController } from './localidad.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { updateLocalidadSchema, idParamsSchema } from 'sigma-la-schemas'

const localidadController = new LocalidadController()
const localidadRouter = Router()

localidadRouter.get('/provincias/:provinciaId', localidadController.getByProvincia)

localidadRouter.get('/', localidadController.getAll)

localidadRouter.post('/', localidadController.create)

localidadRouter.get(
  '/:id',
  validate({ params: idParamsSchema }),
  localidadController.getOne,
)

localidadRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updateLocalidadSchema,
  }),
  localidadController.update,
)

localidadRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  localidadController.remove,
)

export default localidadRouter
