import { Request, Response, NextFunction } from 'express'
import { EmpleadoService } from './empleado.service.js'

const empleadoService = new EmpleadoService()

/**
 * Controlador para manejar las rutas de empleados.
 * Maneja las respuestas HTTP y delega la lógica de negocio al servicio.
 * @class EmpleadoController
 */
export class EmpleadoController {
  /**
   * Crear nuevo empleado (solo ADMIN)
   * La contraseña es OPCIONAL - un empleado puede existir sin acceso al sistema
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const empleado = await empleadoService.create(req.body)
      res.status(201).json({
        success: true,
        message: 'Empleado creado exitosamente',
        data: empleado,
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Ya existe un empleado con ese CUIL') {
          return res.status(409).json({
            success: false,
            message: error.message,
          })
        }
      }
      next(error)
    }
  }

  /**
   * Obtener todos los visitadores activos
   */
  async getVisitadores(req: Request, res: Response, next: NextFunction) {
    try {
      const empleados = await empleadoService.findVisitadores()
      res.json({
        success: true,
        data: empleados,
        count: empleados.length,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Obtener datos del empleado autenticado
   */
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user
      if (!user || !user.cuil) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        })
      }

      const empleado = await empleadoService.findByCuil(user.cuil)
      if (!empleado) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado',
        })
      }

      res.json({
        success: true,
        data: empleado,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Obtener todos los empleados activos
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const empleados = await empleadoService.findAll()
      res.json({
        success: true,
        data: empleados,
        count: empleados.length,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Obtener un empleado por CUIL
   */
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { cuil } = req.params
      const empleado = await empleadoService.findByCuil(cuil)

      if (!empleado) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado',
        })
      }

      res.json({
        success: true,
        data: empleado,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Obtener empleados disponibles para entrega (VISITADOR o PLANTA)
   */
  async getDisponiblesParaEntrega(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const empleados = await empleadoService.findDisponiblesParaEntrega()
      res.json({
        success: true,
        data: empleados,
        count: empleados.length,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Actualizar un empleado
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { cuil } = req.params
      const empleado = await empleadoService.update(cuil, req.body)

      res.json({
        success: true,
        message: 'Empleado actualizado exitosamente',
        data: empleado,
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Empleado no encontrado'
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        })
      }
      next(error)
    }
  }

  /**
   * Desactivar un empleado (soft delete)
   */
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { cuil } = req.params
      const empleado = await empleadoService.remove(cuil)

      res.json({
        success: true,
        message: 'Empleado desactivado exitosamente',
        data: empleado,
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Empleado no encontrado'
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        })
      }
      next(error)
    }
  }
}
