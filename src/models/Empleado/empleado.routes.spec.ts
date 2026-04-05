import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import app from '../../app.js'
import { EmpleadoRepository } from './empleado.repository.js'

/**
 * Tests de Integración - Empleado Routes
 *
 * IMPORTANTE:
 * - POST, PUT, DELETE /api/empleados requieren `authorizeRoles(['ADMIN'])` además del JWT.
 * - POST /api/empleados usa `validate({ body: createEmpleadoSchema })` de sigma-la-schemas.
 * - DELETE /api/empleados/:cuil usa `validate({ params: cuilParamsSchema })`.
 *   Los CUILs deben tener exactamente 11 dígitos numéricos para pasar validación.
 */
vi.mock('./empleado.repository.js')

function makeTestToken(rol = 'ADMIN') {
  return jwt.sign(
    { cuil: '20000000001', rol_actual: rol },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' },
  )
}

// CUIL válido de 11 dígitos que cumpla con el formato (ej. de seeder)
const CUIL_VALIDO = '20999999995'

describe('Integration Tests - Empleado Routes', () => {
  let adminToken: string
  let nonAdminToken: string

  beforeEach(() => {
    vi.clearAllMocks()
    adminToken = makeTestToken('ADMIN')
    nonAdminToken = makeTestToken('VISITADOR')
  })

  // ─── GET /api/empleados ────────────────────────────────────────
  describe('GET /api/empleados', () => {
    it('debería devolver 401 sin token', async () => {
      const response = await request(app).get('/api/empleados')
      expect(response.status).toBe(401)
    })

    it('debería devolver 200 y la lista de empleados activos', async () => {
      vi.spyOn(EmpleadoRepository.prototype, 'findAllPublic').mockResolvedValue([
        { cuil: CUIL_VALIDO, nombre: 'Juan', apellido: 'Pérez', activo: true } as any,
      ])

      const response = await request(app)
        .get('/api/empleados')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveLength(1)
    })
  })

  // ─── POST /api/empleados  (requiere rol ADMIN) ─────────────────
  describe('POST /api/empleados', () => {
    it('debería devolver 403 si el token no tiene rol ADMIN', async () => {
      const response = await request(app)
        .post('/api/empleados')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .send({
          cuil: CUIL_VALIDO,
          nombre: 'Ana',
          apellido: 'García',
          rol_actual: 'VISITADOR',
          area_trabajo: 'ATENCION_CLIENTE',
        })

      expect(response.status).toBe(403)
    })

    it('debería devolver 201 al crear un empleado correctamente con rol ADMIN', async () => {
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue(null)
      vi.spyOn(EmpleadoRepository.prototype, 'create').mockResolvedValue({
        cuil: CUIL_VALIDO,
        nombre: 'Ana',
        apellido: 'García',
        rol_actual: 'VISITADOR',
        area_trabajo: 'ATENCION_CLIENTE',
        activo: true,
        contrasenia: null,
        refreshTokenHash: null,
        fecha_ingreso: new Date() as any,
      } as any)

      const response = await request(app)
        .post('/api/empleados')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cuil: CUIL_VALIDO,
          nombre: 'Ana',
          apellido: 'García',
          rol_actual: 'VISITADOR',
          area_trabajo: 'ATENCION_CLIENTE',
        })

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
    })

    it('debería devolver 409 si el cuil ya está registrado', async () => {
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue({
        cuil: CUIL_VALIDO,
        activo: true,
      } as any)

      const response = await request(app)
        .post('/api/empleados')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cuil: CUIL_VALIDO,
          nombre: 'Ana',
          apellido: 'García',
          rol_actual: 'VISITADOR',
          area_trabajo: 'ATENCION_CLIENTE',
        })

      expect(response.status).toBe(409)
      expect(response.body.status).toBe('fail')
    })
  })

  // ─── DELETE /api/empleados/:cuil  (Soft Delete, requiere ADMIN) ─
  describe('DELETE /api/empleados/:cuil', () => {
    it('debería devolver 403 si el token no tiene rol ADMIN', async () => {
      const response = await request(app)
        .delete(`/api/empleados/${CUIL_VALIDO}`)
        .set('Authorization', `Bearer ${nonAdminToken}`)

      expect(response.status).toBe(403)
    })

    it('debería devolver 404 si el empleado no existe', async () => {
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuilPublic').mockResolvedValue(null)

      const response = await request(app)
        .delete(`/api/empleados/${CUIL_VALIDO}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(404)
    })

    it('debería devolver 200 con el empleado desactivado', async () => {
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuilPublic').mockResolvedValue({
        cuil: CUIL_VALIDO,
        activo: true,
        nombre: 'Ana',
        apellido: 'García',
        rol_actual: 'VISITADOR',
        area_trabajo: 'Campo',
      } as any)
      vi.spyOn(EmpleadoRepository.prototype, 'update').mockResolvedValue({
        cuil: CUIL_VALIDO,
        nombre: 'Ana',
        apellido: 'García',
        rol_actual: 'VISITADOR',
        area_trabajo: 'Campo',
        activo: false,
      } as any)

      const response = await request(app)
        .delete(`/api/empleados/${CUIL_VALIDO}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.activo).toBe(false)
    })
  })
})
