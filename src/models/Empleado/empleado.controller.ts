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

  async getPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extraer el CUIL del usuario autenticado en el token
      const user = req.user
      if (!user || !user.cuil) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        })
      }

      // 2. Pasarle ese CUIL al service
      const configuraciones = await empleadoService.getPerfil(user.cuil)

      if (!configuraciones) {
        return res.status(404).json({
          success: false,
          message: 'Perfil no encontrado',
        })
      }

      // 3. Devolver los datos al Frontend
      // OJO: tu frontend espera recibir un objeto directo { nombre, apellido, cuil } por el fetchWithErrorHandling,
      // te lo dejo como { success, data } por ahora como en tu boilerplate original, pero te recomendaría ajustarlo si falla.
      res.json({
        success: true,
        data: {
          nombre: configuraciones.nombre,
          apellido: configuraciones.apellido,
          cuil: configuraciones.cuil,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Actualizar la contraseña del empleado autenticado
   */
  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user
      if (!user || !user.cuil) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        })
      }

      const { currentPassword, newPassword } = req.body
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Faltan parámetros para actualizar la contraseña',
        })
      }

      await empleadoService.updatePassword(
        user.cuil,
        currentPassword,
        newPassword,
      )

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'La contraseña actual es incorrecta'
      ) {
        return res.status(403).json({
          success: false,
          message: error.message,
        })
      }
      next(error)
    }
  }

  /**
   * Actualizar el perfil del empleado autenticado
   */
  async updatePerfil(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user
      if (!user || !user.cuil) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        })
      }

      // El cuil NO se puede cambiar porque es el PK, entonces omitimos el cuil del body
      const { nombre, apellido } = req.body

      const updatedEmpleado = await empleadoService.update(user.cuil, {
        nombre,
        apellido,
      })

      // Tu Front-end action va a esperar esto como resultado de data
      res.json({
        success: true,
        data: {
          nombre: updatedEmpleado.nombre,
          apellido: updatedEmpleado.apellido,
          cuil: updatedEmpleado.cuil,
        },
      })
    } catch (error) {
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
