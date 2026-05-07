import { Router } from 'express'
import { EmpleadoController } from './empleado.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'

import {
  cuilParamsSchema,
} from 'sigma-la-schemas'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'

const empleadoController = new EmpleadoController()
const empleadoRouter = Router()

/**
 * @route   GET /api/empleados
 * @desc    Obtener todos los empleados activos
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get('/', empleadoController.getAll)

/**
 * @route   GET /api/empleados/configuraciones
 * @desc    Obtener las configuraciones de los empleados
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get('/configuraciones/perfil', empleadoController.getPerfil)

/**
 * @route   PUT /api/empleados/configuraciones/password
 * @desc    Actualizar la contraseña del empleado
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.put('/configuraciones/password', empleadoController.updatePassword)

/**
 * @route   PUT /api/empleados/configuraciones/perfil
 * @desc    Actualizar el perfil del empleado
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.put('/configuraciones/perfil', empleadoController.updatePerfil)

/**
 * @route   GET /api/empleados/visitadores
 * @desc    Obtener todos los visitadores activos
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get('/visitadores', empleadoController.getVisitadores)

/**
 * @route   GET /api/empleados/me
 * @desc    Obtener información del empleado autenticado
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get('/me', empleadoController.getMe)

/**
 * @route   GET /api/empleados/disponibles-entrega
 * @desc    Obtener empleados disponibles para entrega (VISITADOR o PLANTA)
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get('/disponibles-entrega', empleadoController.getDisponiblesParaEntrega)

empleadoRouter.post(
  '/',
  authorize('empleado', 'crear'),
  empleadoController.create,
)

/**
 * @route   GET /api/empleados/:cuil
 * @desc    Obtener un empleado por CUIL
 * @access  Privado (requiere autenticación)
 */
empleadoRouter.get(
  '/:cuil',
  validate({ params: cuilParamsSchema }),
  empleadoController.getOne,
)

/**
 * @route   PUT /api/empleados/:cuil
 * @desc    Actualizar un empleado
 * @access  Privado (solo ADMIN)
 */
empleadoRouter.put(
  '/:cuil',
  authorize('empleado', 'actualizar'),
  validate({
    params: cuilParamsSchema,
  }),
  empleadoController.update,
)

/**
 * @route   DELETE /api/empleados/:cuil
 * @desc    Desactivar un empleado (soft delete)
 * @access  Privado (solo ADMIN)
 */
empleadoRouter.delete(
  '/:cuil',
  authorize('empleado', 'eliminar'),
  validate({ params: cuilParamsSchema }),
  empleadoController.remove,
)


export default empleadoRouter
