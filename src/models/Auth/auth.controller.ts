import { AuthService } from './auth.service.js'
import { registerSchema, loginSchema } from './auth.schemas.js'
import { parse } from 'valibot'
import { Request, Response } from 'express'

/**
 * Controlador para manejar los endpoints de autenticación.
 * @class AuthController
 * @method register - POST /api/auth/register
 * @method login - POST /api/auth/login
 */
export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  /**
   * Endpoint para registrar un nuevo empleado (visitador).
   * @param {Request} req - Express request
   * @param {Response} res - Express response
   */
  async register(req: Request, res: Response) {
    try {
      const data = parse(registerSchema, req.body)
      const empleado = await this.authService.register(data)
      res.status(201).json({ empleado })
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Endpoint para login de empleado.
   * @param {Request} req - Express request
   * @param {Response} res - Express response
   */
  async login(req: Request, res: Response) {
    try {
      const { cuil, contrasenia } = parse(loginSchema, req.body)
      const result = await this.authService.login(cuil, contrasenia)
      res.status(200).json(result)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(401).json({ error: message })
    }
  }

  /**
   * Endpoint para obtener el perfil del usuario autenticado.
   * @param {Request} req - Express request
   * @param {Response} res - Express response
   */
  async getProfile(req: Request, res: Response) {
    try {
      const cuil = req.user?.cuil
      const empleado = await this.authService.getProfile(cuil ? cuil : '')
      res.status(200).json(empleado)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(404).json({ error: message })
    }
  }
}
