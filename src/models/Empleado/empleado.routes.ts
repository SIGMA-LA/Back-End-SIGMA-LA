import { Router } from 'express'
import { EmpleadoController } from './empleado.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  createEmpleadoSchema,
  updateEmpleadoSchema,
  cuilParamsSchema,
} from 'sigma-la-schemas'
import { authorizeRoles } from '../Auth/auth.middleware.js'

const empleadoController = new EmpleadoController()
const empleadoRouter = Router()

/**
 * @route   GET /api/empleados
 * @desc    Obtener todos los empleados activos
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get('/', (req, res, next) => {
  empleadoController.getAll(req, res, next)
})

/**
 * @route   GET /api/empleados/configuraciones
 * @desc    Obtener las configuraciones de los empleados
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get('/configuraciones/perfil', (req, res, next) => {
  empleadoController.getPerfil(req, res, next)
})

/**
 * @route   PUT /api/empleados/configuraciones/password
 * @desc    Actualizar la contraseña del empleado
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.put('/configuraciones/password', (req, res, next) => {
  empleadoController.updatePassword(req, res, next)
})

/**
 * @route   PUT /api/empleados/configuraciones/perfil
 * @desc    Actualizar el perfil del empleado
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.put('/configuraciones/perfil', (req, res, next) => {
  empleadoController.updatePerfil(req, res, next)
})

/**
 * @route   PUT /api/empleados/configuraciones/notificaciones
 * @desc    Actualizar las notificaciones del empleado
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.put('/configuraciones/notificaciones', (req, res, next) => {
  empleadoController.updateNotificaciones(req, res, next)
})

/**
 * @route   GET /api/empleados/visitadores
 * @desc    Obtener todos los visitadores activos
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get('/visitadores', (req, res, next) => {
  empleadoController.getVisitadores(req, res, next)
})

/**
 * @route   GET /api/empleados/me
 * @desc    Obtener información del empleado autenticado
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get('/me', (req, res, next) => {
  empleadoController.getMe(req, res, next)
})

/**
 * @route   GET /api/empleados/disponibles-entrega
 * @desc    Obtener empleados disponibles para entrega (VISITADOR o PLANTA)
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get('/disponibles-entrega', (req, res, next) => {
  empleadoController.getDisponiblesParaEntrega(req, res, next)
})

/**
 * @route   POST /api/empleados
 * @desc    Crear nuevo empleado
 * @access  Privado (solo ADMIN)
 */
empleadoRouter.post(
  '/',
  authorizeRoles(['ADMIN']),
  validate({ body: createEmpleadoSchema }),
  (req, res, next) => {
    empleadoController.create(req, res, next)
  },
)

/**
 * @route   GET /api/empleados/:cuil
 * @desc    Obtener un empleado por CUIL
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get(
  '/:cuil',
  validate({ params: cuilParamsSchema }),
  (req, res, next) => {
    empleadoController.getOne(req, res, next)
  },
)

/**
 * @route   PUT /api/empleados/:cuil
 * @desc    Actualizar un empleado
 * @access  Privado (solo ADMIN)
 */
empleadoRouter.put(
  '/:cuil',
  authorizeRoles(['ADMIN']),
  validate({
    params: cuilParamsSchema,
    body: updateEmpleadoSchema,
  }),
  (req, res, next) => {
    empleadoController.update(req, res, next)
  },
)

/**
 * @route   DELETE /api/empleados/:cuil
 * @desc    Desactivar un empleado (soft delete)
 * @access  Privado (solo ADMIN)
 */
empleadoRouter.delete(
  '/:cuil',
  authorizeRoles(['ADMIN']),
  validate({ params: cuilParamsSchema }),
  (req, res, next) => {
    empleadoController.remove(req, res, next)
  },
)

export default empleadoRouter
