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
clienteRouter.get('/', (req, res) => {
  clienteController.getAll(req, res)
})

/**
 * @route   GET /api/clientes/buscar
 * @desc    Buscar clientes con filtros
 * @access  Privado (requiere autenticación)
 */
clienteRouter.get('/buscar', (req, res) => {
  clienteController.buscar(req, res)
})

/**
 * @route   POST /api/clientes
 * @desc    Crear nuevo cliente
 * @access  Privado (requiere autenticación)
 */
clienteRouter.post('/', (req, res) => {
  clienteController.create(req, res)
})

/**
 * @route   GET /api/clientes/:cuil
 * @desc    Obtener un cliente por CUIL
 * @access  Privado (requiere autenticación)
 */
clienteRouter.get(
  '/:cuil',
  validate({ params: cuilParamsSchema }),
  (req, res) => {
    clienteController.getOne(req, res)
  },
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
  (req, res) => {
    clienteController.update(req, res)
  },
)

/**
 * @route   DELETE /api/clientes/:cuil
 * @desc    Eliminar un cliente
 * @access  Privado (requiere autenticación)
 */
clienteRouter.delete(
  '/:cuil',
  validate({ params: cuilParamsSchema }),
  (req, res, next) => {
    clienteController.remove(req, res, next)
  },
)

export default clienteRouter
