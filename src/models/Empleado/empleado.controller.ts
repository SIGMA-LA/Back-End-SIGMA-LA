import { Request, Response } from 'express'
import { EmpleadoService } from './empleado.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

const empleadoService = new EmpleadoService()

/**
 * Controlador para manejar las rutas de empleados.
 */
export class EmpleadoController {
  create = catchAsync(async (req: Request, res: Response) => {
    const empleado = await empleadoService.create(req.body)
    return sendSuccess(res, empleado, 'Empleado creado exitosamente', 201)
  })

  getPerfil = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    if (!user?.cuil) {
      throw new AppError('Usuario no autenticado', 401, 'UNAUTHORIZED')
    }

    const perfil = await empleadoService.getPerfil(user.cuil)
    return sendSuccess(res, perfil)
  })

  updatePassword = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    if (!user?.cuil) {
      throw new AppError('Usuario no autenticado', 401, 'UNAUTHORIZED')
    }

    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      throw new AppError('Faltan parámetros para actualizar la contraseña', 400, 'MISSING_PARAMS')
    }

    await empleadoService.updatePassword(
      user.cuil,
      currentPassword,
      newPassword,
    )

    return sendSuccess(res, null, 'Contraseña actualizada exitosamente')
  })

  updatePerfil = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    if (!user?.cuil || !user.rol_actual) {
      throw new AppError('Usuario no autenticado o faltan permisos de rol', 401, 'UNAUTHORIZED')
    }

    const { nombre, apellido, mail, notificaciones } = req.body

    // 1. Actualizar datos básicos
    await empleadoService.update(user.cuil, {
      nombre,
      apellido,
      mail,
    })

    // 2. Actualizar notificaciones si están presentes
    if (notificaciones) {
      await empleadoService.updateNotifications(
        user.cuil,
        user.rol_actual,
        notificaciones,
      )
    }

    // 3. Obtener el perfil actualizado
    const perfilActualizado = await empleadoService.getPerfil(user.cuil)
    return sendSuccess(res, perfilActualizado, 'Perfil actualizado exitosamente')
  })

  getVisitadores = catchAsync(async (req: Request, res: Response) => {
    const empleados = await empleadoService.findVisitadores()
    return sendSuccess(res, empleados)
  })

  getMe = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    if (!user?.cuil) {
      throw new AppError('Usuario no autenticado', 401, 'UNAUTHORIZED')
    }

    const empleado = await empleadoService.findByCuil(user.cuil)
    return sendSuccess(res, empleado)
  })

  getAll = catchAsync(async (req: Request, res: Response) => {
    const empleados = await empleadoService.findAll()
    return sendSuccess(res, empleados)
  })

  getOne = catchAsync(async (req: Request, res: Response) => {
    const { cuil } = req.params
    const empleado = await empleadoService.findByCuil(cuil, true)
    return sendSuccess(res, empleado)
  })

  getDisponiblesParaEntrega = catchAsync(async (req: Request, res: Response) => {
    const empleados = await empleadoService.findDisponiblesParaEntrega()
    return sendSuccess(res, empleados)
  })

  update = catchAsync(async (req: Request, res: Response) => {
    const { cuil } = req.params
    const empleado = await empleadoService.update(cuil, req.body)
    return sendSuccess(res, empleado, 'Empleado actualizado exitosamente')
  })

  remove = catchAsync(async (req: Request, res: Response) => {
    const { cuil } = req.params
    const empleado = await empleadoService.remove(cuil)
    return sendSuccess(res, empleado, 'Empleado desactivado exitosamente')
  })
}

