import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest'
import { AuthService } from './auth.service'
import { EmpleadoRepository } from '../Empleado/empleado.repository'
import { empleado } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

vi.mock('../Empleado/empleado.repository')
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
    decode: vi.fn(),
  },
}))
vi.mock('../../config/env', () => ({
  env: {
    JWT_SECRET: 'secret',
    NODE_AUTH_REFRESH_TOKEN: 'refresh-secret',
  },
}))

describe('AuthService - Pruebas Unitarias', () => {
  let authService: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    authService = new AuthService()
  })

  describe('register()', () => {
    it('debería hashear la contraseña y llamar al repositorio', async () => {
      (bcrypt.hash as Mock).mockResolvedValue('hashed-pass')
      const createMock = vi.spyOn(EmpleadoRepository.prototype, 'create').mockResolvedValue({
        cuil: '1234',
        contrasenia: 'hashed-pass',
      } as unknown as empleado)

      await authService.register({
        cuil: '1234',
        nombre: 'Test',
        apellido: 'A',
        rol_actual: 'VISITADOR',
        area_trabajo: 'A',
        contrasenia: '123',
      })

      expect(bcrypt.hash).toHaveBeenCalledWith('123', 10)
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ contrasenia: 'hashed-pass' })
      )
    })
  })

  describe('login()', () => {
    it('debería rechazar si el usuario o la contraseña no existen o son inválidos', async () => {
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue(null)
      await expect(authService.login('20111111112', 'pass')).rejects.toThrow('CUIL o contraseña incorrectos')

      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue({
        cuil: '20111111112',
        contrasenia: 'hash',
        activo: true,
      } as unknown as empleado)
      ;(bcrypt.compare as Mock).mockResolvedValue(false)
      
      await expect(authService.login('20111111112', 'badpass')).rejects.toThrow('CUIL o contraseña incorrectos')
    })

    it('debería generar token y refreshToken si las credenciales son válidas', async () => {
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue({
        cuil: '20111111112',
        contrasenia: 'hash',
        activo: true,
      } as unknown as empleado)
      ;(bcrypt.compare as Mock).mockResolvedValue(true)
      ;(jwt.sign as Mock)
        .mockReturnValueOnce('token-jwt')
        .mockReturnValueOnce('refresh-token-jwt')
      ;(bcrypt.hash as Mock).mockResolvedValue('hashed-refresh')

      const updateMock = vi.spyOn(EmpleadoRepository.prototype, 'updateRefreshTokenHash').mockResolvedValue(undefined)

      const result = await authService.login('20111111112', 'pass')

      expect(result.token).toBe('token-jwt')
      expect(result.refreshToken).toBe('refresh-token-jwt')
      expect(updateMock).toHaveBeenCalledWith('20111111112', 'hashed-refresh')
    })
  })

  describe('refreshAccessToken()', () => {
    it('debería generar un nuevo token si el refreshToken es válido', async () => {
      ;(jwt.verify as Mock).mockReturnValue({ cuil: '111' })
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue({
        cuil: '111',
        refreshTokenHash: 'hash-rt',
        activo: true,
      } as unknown as empleado)
      ;(bcrypt.compare as Mock).mockResolvedValue(true)
      ;(jwt.sign as Mock).mockReturnValue('nuevo-token')

      const result = await authService.refreshAccessToken('rt-valido')
      
      expect(result.token).toBe('nuevo-token')
      expect(jwt.verify).toHaveBeenCalled()
      expect(bcrypt.compare).toHaveBeenCalledWith('rt-valido', 'hash-rt')
    })

    it('debería arrojar error si la firma falla', async () => {
      ;(jwt.verify as Mock).mockImplementation(() => { throw new Error('invalid') })
      await expect(authService.refreshAccessToken('rt-malo')).rejects.toThrow('Refresh token invalid or expired')
    })
  })
})
