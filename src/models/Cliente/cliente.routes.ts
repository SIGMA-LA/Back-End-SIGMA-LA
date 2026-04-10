import { Router } from 'express'
import { ClienteController } from './cliente.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'
import { updateClienteSchema, cuilParamsSchema } from 'sigma-la-schemas'

const clienteController = new ClienteController()
const clienteRouter = Router()

/**
 * @route   GET /api/clientes
 * @desc    Obtener todos los clientes
 * @access  Privado (requiere autenticación)
 */
clienteRouter.get('/', authorize('cliente', 'obtener'), clienteController.getAll)



/**
 * @route   POST /api/clientes
 * @desc    Crear nuevo cliente
 * @access  Privado (requiere autenticación)
 */
clienteRouter.post('/', authorize('cliente', 'crear'), clienteController.create)

/**
 * @route   GET /api/clientes/:cuil
 * @desc    Obtener un cliente por CUIL
 * @access  Privado (requiere autenticación)
 */
clienteRouter.get(
  '/:cuil',
  validate({ params: cuilParamsSchema }),
  authorize('cliente', 'obtener'),
  clienteController.getOne,
)

/**
 * @route   PUT /api/clientes/:cuil
 * @desc    Actualizar un cliente
 * @access  Privado (requiere autenticación)
 */
clienteRouter.put(
  '/:cuil',
  validate({
    params: cuilParamsSchema,
    body: updateClienteSchema,
  }),
  authorize('cliente', 'actualizar'),
  clienteController.update,
)

/**
 * @route   DELETE /api/clientes/:cuil
 * @desc    Eliminar un cliente
 * @access  Privado (requiere autenticación)
 */
clienteRouter.delete(
  '/:cuil',
  validate({ params: cuilParamsSchema }),
  authorize('cliente', 'eliminar'),
  clienteController.remove,
)


export default clienteRouter
