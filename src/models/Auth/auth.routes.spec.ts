import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../../app.js'
import { AuthService } from './auth.service.js'

/**
 * Tests de Integración - Auth Routes
 *
 * AuthController instancia AuthService dentro de la clase (this.authService = new AuthService())
 * → vi.mock del módulo funciona porque Vitest reemplaza el módulo ANTES de que el controller
 *   importe y llame al constructor.
 */
vi.mock('./auth.service.js')

describe('Integration Tests - Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── POST /api/auth/login ──────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('debería devolver 401 si las credenciales son inválidas', async () => {
      vi.spyOn(AuthService.prototype, 'login').mockRejectedValue(
        new Error('Credenciales inválidas'),
      )
      const response = await request(app)
        .post('/api/auth/login')
        .send({ cuil: '20111111112', contrasenia: 'incorrecta' })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error', 'Credenciales inválidas')
    })

    it('debería devolver 400 si el body no pasa la validación del schema', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ cuil: '123', contrasenia: '' })

      expect(response.status).toBe(400)
    })

    it('debería devolver 200 y setear cookies httpOnly si el login es exitoso', async () => {
      vi.spyOn(AuthService.prototype, 'login').mockResolvedValue({
        token: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        empleado: {
          cuil: '20111111112',
          nombre: 'Carlos',
          apellido: 'Test',
          rol_actual: 'ADMIN',
          activo: true,
        } as any,
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({ cuil: '20111111112', contrasenia: 'pass1234' })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken', 'mock-access-token')
      expect(response.body.usuario).toMatchObject({ cuil: '20111111112', nombre: 'Carlos' })
      const cookies = response.headers['set-cookie'] as unknown as string[]
      expect(cookies.some((c: string) => c.startsWith('accessToken='))).toBe(true)
    })
  })

  // ─── POST /api/auth/logout ─────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('debería devolver 204 y limpiar las cookies', async () => {
      vi.spyOn(AuthService.prototype, 'logout').mockResolvedValue(undefined)

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', 'refreshToken=mock-refresh-token')

      expect(response.status).toBe(204)
    })
  })

  // ─── GET /api/auth/profile  (protegida) ───────────────────────
  describe('GET /api/auth/profile', () => {
    it('debería devolver 401 si no se envía token', async () => {
      const response = await request(app).get('/api/auth/profile')
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error', 'Token no proporcionado')
    })

    it('debería devolver 403 si el token es inválido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer token-falso-invalido')

      expect(response.status).toBe(403)
      expect(response.body).toHaveProperty('error', 'Token inválido')
    })
  })
})
