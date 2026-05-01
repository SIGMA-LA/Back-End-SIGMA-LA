import { Router } from 'express'
import { ParametroController } from './parametro.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'
import { createParametroSchema, updateParametroSchema } from 'sigma-la-schemas'

const parametroController = new ParametroController()
const parametroRouter = Router()

parametroRouter.get('/', parametroController.getAll)

parametroRouter.post(
  '/',
  validate({ body: createParametroSchema }),
  authorize('parametro', 'crear'),
  parametroController.create,
)

parametroRouter.get('/actual', parametroController.getActual)

parametroRouter.get('/actual/viatico', parametroController.getActualViatico)

parametroRouter.get('/:id', parametroController.getOne)

parametroRouter.put(
  '/:id',
  validate({ body: updateParametroSchema }),
  authorize('parametro', 'actualizar'),

  parametroController.update,
)

parametroRouter.delete('/:id', parametroController.remove)


export default parametroRouter
