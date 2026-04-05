import { EmpleadoRepository } from '../Empleado/empleado.repository.js'
import { empleado } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../../config/env.js'
import { AppError } from '../../shared/errors/AppError.js'

const JWT_EXPIRES_IN = '8h'

/**
 * Service to manage authentication (auth) operations for employees.
 */
export class AuthService {
  private empleadoRepository: EmpleadoRepository

  constructor() {
    this.empleadoRepository = new EmpleadoRepository()
  }

  /**
   * Registers a new employee (visitador) with an encrypted password.
   * @param data Employee data (cuil, nombre, apellido, rol_actual, area_trabajo, contrasenia).
   * @returns The created employee.
   */
  async register(data: {
    cuil: string
    nombre: string
    apellido: string
    rol_actual: string
    area_trabajo: string
    contrasenia: string
  }): Promise<empleado> {
    const hashedPassword = await bcrypt.hash(data.contrasenia, 10)
    return await this.empleadoRepository.create({
      ...data,
      contrasenia: hashedPassword,
    })
  }

  /**
   * Logs in an employee by validating credentials and generating a JWT.
   * @param cuil Employee CUIL.
   * @param contrasenia Plain text password.
   * @returns An object containing the JWT, employee data, and refresh token.
   */
  async login(
    cuil: string,
    contrasenia: string,
  ): Promise<{ token: string; empleado: empleado; refreshToken: string }> {
    const empleado = await this.empleadoRepository.findByCuil(cuil)
    if (!empleado || !empleado.contrasenia) {
      throw new AppError('CUIL o contraseña incorrectos', 401, 'INVALID_CREDENTIALS')
    }

    const isValid = await this.verifyPassword(contrasenia, empleado.contrasenia)
    if (!isValid) {
      throw new AppError('CUIL o contraseña incorrectos', 401, 'INVALID_CREDENTIALS')
    }

    const token = this.generateToken(empleado)

    const refreshToken = jwt.sign(
      { cuil: empleado.cuil, jti: uuidv4() },
      env.NODE_AUTH_REFRESH_TOKEN,
      { expiresIn: '30d' },
    )

    const hash = await bcrypt.hash(refreshToken, 10)
    await this.empleadoRepository.updateRefreshTokenHash(empleado.cuil, hash)

    return { token, refreshToken, empleado }
  }

  /**
   * Logs out an employee by clearing their refresh token hash.
   * @param refreshToken The refresh token to invalidate.
   */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return
    const payload = jwt.decode(refreshToken) as { cuil?: string }
    if (payload?.cuil) {
      await this.empleadoRepository.updateRefreshTokenHash(payload.cuil, null)
    }
  }

  /**
   * Compares the input password with the stored hash.
   * @param plain Plain text password.
   * @param hash Encrypted password.
   * @returns True if they match.
   */
  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash)
  }

  /**
   * Genera a JWT with the employee ID and role.
   * @param empleado Employee data.
   * @returns The generated JWT.
   */
  generateToken(empleado: empleado): string {
    return jwt.sign(
      {
        cuil: empleado.cuil,
        rol_actual: empleado.rol_actual,
      },
      env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )
  }

  /**
   * Gets employee data by CUIL (without sensitive fields).
   * @param cuil Employee CUIL.
   * @returns Employee data.
   */
  async getProfile(cuil: string): Promise<Omit<empleado, 'contrasenia' | 'refreshTokenHash'>> {
    const empleado = await this.empleadoRepository.findByCuil(cuil)
    if (!empleado) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasenia, refreshTokenHash, ...empleadoSinContrasenia } = empleado
    return empleadoSinContrasenia
  }

  /**
   * Refreshes the access token using a valid refresh token.
   * @param refreshToken The refresh token.
   * @returns A new access token.
   */
  async refreshAccessToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const payload = jwt.verify(
        refreshToken,
        env.NODE_AUTH_REFRESH_TOKEN,
      ) as jwt.JwtPayload
      if (!payload.cuil) {
        throw new AppError('Sesión expirada o inválida, por favor inicie sesión nuevamente', 401, 'INVALID_REFRESH_TOKEN')
      }

      const empleado = await this.empleadoRepository.findByCuil(payload.cuil)
      if (!empleado || !empleado.refreshTokenHash) {
        throw new AppError('Refresh token invalid or expired', 401, 'INVALID_REFRESH_TOKEN')
      }

      const isValid = await bcrypt.compare(
        refreshToken,
        empleado.refreshTokenHash,
      )
      if (!isValid) {
        throw new AppError('Refresh token invalid or expired', 401, 'INVALID_REFRESH_TOKEN')
      }

      const token = this.generateToken(empleado)
      return { token }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError('Refresh token invalid or expired', 401, 'INVALID_REFRESH_TOKEN')
    }
  }
}

