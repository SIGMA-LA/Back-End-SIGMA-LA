import { Router } from 'express'
import { ClienteController } from './cliente.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { updateClienteSchema, cuilParamsSchema } from 'sigma-la-schemas'

const clienteController = new ClienteController()
const clienteRouter = Router()

/**
 * @route   GET /api/clientes
 * @desc    Obtener todos los clientes
 * @access  Privado (requiere autenticación)
 */
clienteRouter.get('/', clienteController.getAll)

/**
 * @route   GET /api/clientes/buscar
 * @desc    Buscar clientes con filtros
 * @access  Privado (requiere autenticación)
 */
clienteRouter.get('/buscar', clienteController.buscar)

/**
 * @route   POST /api/clientes
 * @desc    Crear nuevo cliente
 * @access  Privado (requiere autenticación)
 */
clienteRouter.post('/', clienteController.create)

/**
 * @route   GET /api/clientes/:cuil
 * @desc    Obtener un cliente por CUIL
 * @access  Privado (requiere autenticación)
 */
clienteRouter.get(
  '/:cuil',
  validate({ params: cuilParamsSchema }),
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
  clienteController.remove,
)


export default clienteRouter
