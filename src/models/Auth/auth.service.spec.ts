import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AuthService } from './auth.service'
import { EmpleadoRepository } from '../Empleado/empleado.repository'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env'

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
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-pass' as any)
      const createMock = vi.spyOn(EmpleadoRepository.prototype, 'create').mockResolvedValue({
        cuil: '1234',
        contrasenia: 'hashed-pass',
      } as any)

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
      await expect(authService.login('111', 'pass')).rejects.toThrow('Credenciales inválidas')

      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue({
        cuil: '111',
        contrasenia: 'hash',
      } as any)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as any)
      
      await expect(authService.login('111', 'badpass')).rejects.toThrow('Credenciales inválidas')
    })

    it('debería generar token y refreshToken si las credenciales son válidas', async () => {
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue({
        cuil: '111',
        contrasenia: 'hash',
      } as any)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as any)
      vi.mocked(jwt.sign)
        .mockReturnValueOnce('token-jwt' as any)
        .mockReturnValueOnce('refresh-token-jwt' as any)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-refresh' as any)

      const updateMock = vi.spyOn(EmpleadoRepository.prototype, 'updateRefreshTokenHash').mockResolvedValue(undefined)

      const result = await authService.login('111', 'pass')

      expect(result.token).toBe('token-jwt')
      expect(result.refreshToken).toBe('refresh-token-jwt')
      expect(updateMock).toHaveBeenCalledWith('111', 'hashed-refresh')
    })
  })

  describe('refreshAccessToken()', () => {
    it('debería generar un nuevo token si el refreshToken es válido', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ cuil: '111' } as any)
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue({
        cuil: '111',
        refreshTokenHash: 'hash-rt',
      } as any)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as any)
      vi.mocked(jwt.sign).mockReturnValue('nuevo-token' as any)

      const result = await authService.refreshAccessToken('rt-valido')
      
      expect(result.token).toBe('nuevo-token')
      expect(jwt.verify).toHaveBeenCalled()
      expect(bcrypt.compare).toHaveBeenCalledWith('rt-valido', 'hash-rt')
    })

    it('debería arrojar error si la firma falla', async () => {
      vi.mocked(jwt.verify).mockImplementation(() => { throw new Error('invalid') })
      await expect(authService.refreshAccessToken('rt-malo')).rejects.toThrow('Refresh token inválido')
    })
  })
})
