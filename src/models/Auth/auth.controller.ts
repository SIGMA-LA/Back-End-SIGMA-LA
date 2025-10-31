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

  async login(req: Request, res: Response) {
    try {
      const { cuil, contrasenia } = parse(loginSchema, req.body)
      const { token, refreshToken, empleado } = await this.authService.login(
        cuil,
        contrasenia,
      )

      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60 * 1000,
        path: '/',
      })
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
      })

      const usuarioSeguro = {
        cuil: empleado.cuil,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        rol_actual: empleado.rol_actual,
      }

      res.cookie('usuario', JSON.stringify(usuarioSeguro), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60 * 1000,
        path: '/',
      })
      res.status(200).json({ usuario: usuarioSeguro })
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(401).json({ error: message })
    }
  }

  async logout(req: Request, res: Response) {
    try {
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
      res.clearCookie('usuario')
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken
      await this.authService.logout(refreshToken)
      res.status(204).send()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(400).json({ error: message })
    }
  }

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

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) {
        return res.status(401).json({ error: 'No hay refresh token' })
      }
      const { token } = await this.authService.refreshAccessToken(refreshToken)
      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60 * 1000,
      })
      res.status(200).json({ message: 'Token refrescado' })
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(401).json({ error: message })
    }
  }
}
