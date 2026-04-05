import { AuthService } from './auth.service.js'
import { registerSchema, loginSchema } from './auth.schemas.js'
import { parse } from 'valibot'
import { Request, Response } from 'express'
import { env } from '../../config/env.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

const baseCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
}

/**
 * Controller to handle authentication endpoints.
 */
export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  /**
   * Registers a new employee.
   */
  register = catchAsync(async (req: Request, res: Response) => {
    const data = parse(registerSchema, req.body)
    const empleado = await this.authService.register(data)
    return sendSuccess(res, { empleado }, 'User registered successfully', 201)
  })

  /**
   * Logs in an employee and sets authentication cookies.
   */
  login = catchAsync(async (req: Request, res: Response) => {
    const { cuil, contrasenia } = parse(loginSchema, req.body)
    const { token, refreshToken, empleado } = await this.authService.login(
      cuil,
      contrasenia,
    )

    res.cookie('accessToken', token, {
      ...baseCookieOptions,
      maxAge: 8 * 60 * 60 * 1000,
    })
    res.cookie('refreshToken', refreshToken, {
      ...baseCookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    const usuarioSeguro = {
      cuil: empleado.cuil,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      rol_actual: empleado.rol_actual,
    }

    res.cookie('usuario', JSON.stringify(usuarioSeguro), {
      ...baseCookieOptions,
      maxAge: 8 * 60 * 60 * 1000,
    })

    return sendSuccess(res, {
      usuario: usuarioSeguro,
      accessToken: token,
      refreshToken,
    }, 'Login successful')
  })

  /**
   * Logs out an employee and clears authentication cookies.
   */
  logout = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie('accessToken', baseCookieOptions)
    res.clearCookie('refreshToken', baseCookieOptions)
    res.clearCookie('usuario', baseCookieOptions)

    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken
    await this.authService.logout(refreshToken)

    return res.status(204).send()
  })

  /**
   * Gets the profile of the currently logged-in employee.
   */
  getProfile = catchAsync(async (req: Request, res: Response) => {
    const cuil = req.user?.cuil
    if (!cuil) throw new AppError('Authentication required', 401, 'UNAUTHORIZED')

    const empleado = await this.authService.getProfile(cuil)
    return sendSuccess(res, empleado)
  })

  /**
   * Refreshes the access token using the refresh token cookie.
   */
  refresh = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
      throw new AppError('No refresh token provided', 401, 'MISSING_REFRESH_TOKEN')
    }

    const { token } = await this.authService.refreshAccessToken(refreshToken)

    res.cookie('accessToken', token, {
      ...baseCookieOptions,
      maxAge: 8 * 60 * 60 * 1000,
    })

    return sendSuccess(res, { message: 'Token refreshed' })
  })
}

export const authController = new AuthController()

