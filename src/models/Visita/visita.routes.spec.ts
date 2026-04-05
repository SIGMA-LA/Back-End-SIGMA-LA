import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import app from '../../app.js'
import { VisitaRepository, type VisitaWithRelations } from './visita.repository.js'
// import type { visita } from '@prisma/client' // Removido para evitar error de lint no-unused-vars
import { EmpleadoRepository } from '../Empleado/empleado.repository.js'
import { VehiculoRepository } from '../Vehiculo/vehiculo.repository.js'

/**
 * Tests de Integración - Visita Routes
 *
 * Mockeamos los repositorios (capa más baja) para interceptar los singletons.
 * VisitaService → EmpleadoService.verificarDisponibilidadEmpleados → EmpleadoRepository.findUsagesInRange
 * VisitaService → VehiculoService.verificarDisponibilidadVehiculos → VehiculoRepository.findConflictingUsageForPatentes
 */
vi.mock('./visita.repository.js')
vi.mock('../Empleado/empleado.repository.js')
vi.mock('../Vehiculo/vehiculo.repository.js')

function makeTestToken(rol = 'ADMIN') {
  return jwt.sign(
    { cuil: '20000000001', rol_actual: rol },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' },
  )
}

describe('Integration Tests - Visita Routes', () => {
  let token: string

  beforeEach(() => {
    vi.clearAllMocks()
    token = makeTestToken()
  })

  // ─── GET /api/visitas ──────────────────────────────────────────
  describe('GET /api/visitas', () => {
    it('debería devolver 401 sin token', async () => {
      const response = await request(app).get('/api/visitas')
      expect(response.status).toBe(401)
    })

    it('debería devolver 200 y la lista de visitas', async () => {
      vi.spyOn(VisitaRepository.prototype, 'findAll').mockResolvedValue([
        { cod_visita: 1, motivo_visita: 'Presupuesto', estado: 'PROGRAMADA' } as unknown as VisitaWithRelations,
        { cod_visita: 2, motivo_visita: 'Medición', estado: 'COMPLETADA' } as unknown as VisitaWithRelations,
      ])

      const response = await request(app)
        .get('/api/visitas')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
    })
  })

  // ─── POST /api/visitas ─────────────────────────────────────────
  describe('POST /api/visitas', () => {
    it('debería devolver 201 al crear una visita sin conflictos', async () => {
      // Sin conflictos de agenda
      vi.spyOn(EmpleadoRepository.prototype, 'findUsagesInRange').mockResolvedValue([])
      // VehiculoService usa findConflictingUsageForPatentes (no findUsagesInRange)
      vi.spyOn(VehiculoRepository.prototype, 'findConflictingUsageForPatentes').mockResolvedValue([])
      vi.spyOn(VisitaRepository.prototype, 'create').mockResolvedValue({
        cod_visita: 5,
        motivo_visita: 'Presupuesto',
        estado: 'PROGRAMADA',
        obra: {
          cliente: {
            nombre: 'Juan Mock',
            mail: 'test@ejemplo.com' // Esto disparará la lógica de email en el test si EmailService no está mockeado
          },
          direccion: 'Calle Falsa 123'
        }
      } as unknown as VisitaWithRelations)

      const response = await request(app)
        .post('/api/visitas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          empleados_visita: ['20111111112'],
          fecha_hora_visita: new Date().toISOString(),
          motivo_visita: 'Presupuesto',
          vehiculo: 'AB123CD',
        })

      expect(response.status).toBe(201)
    })
  })

  // ─── PATCH /api/visitas/:id/finalizar ─────────────────────────
  describe('PATCH /api/visitas/:id/finalizar', () => {
    it('debería devolver 404 si la visita no existe', async () => {
      vi.spyOn(VisitaRepository.prototype, 'findById').mockResolvedValue(null)

      const response = await request(app)
        .patch('/api/visitas/999/finalizar')
        .set('Authorization', `Bearer ${token}`)
        .send({ observaciones: 'Medidas tomadas' })

      expect(response.status).toBe(404)
    })

    it('debería devolver 200 y la visita completada', async () => {
      vi.spyOn(VisitaRepository.prototype, 'findById').mockResolvedValue({
        cod_visita: 1,
        estado: 'PROGRAMADA',
      } as unknown as VisitaWithRelations)
      vi.spyOn(VisitaRepository.prototype, 'update').mockResolvedValue({
        cod_visita: 1,
        estado: 'COMPLETADA',
        observaciones: 'Medidas tomadas',
      } as unknown as VisitaWithRelations)

      const response = await request(app)
        .patch('/api/visitas/1/finalizar')
        .set('Authorization', `Bearer ${token}`)
        .send({ observaciones: 'Medidas tomadas' })

      expect(response.status).toBe(200)
      expect(response.body.data.estado).toBe('COMPLETADA')
    })
  })

  // ─── PATCH /api/visitas/:id/cancelar ──────────────────────────
  describe('PATCH /api/visitas/:id/cancelar', () => {
    it('debería devolver 200 y la visita cancelada', async () => {
      vi.spyOn(VisitaRepository.prototype, 'findById').mockResolvedValue({
        cod_visita: 2,
        estado: 'PROGRAMADA',
      } as unknown as VisitaWithRelations)
      vi.spyOn(VisitaRepository.prototype, 'update').mockResolvedValue({
        cod_visita: 2,
        estado: 'CANCELADA',
        observaciones: 'Visita cancelada: Cliente ausente',
      } as unknown as VisitaWithRelations)

      const response = await request(app)
        .patch('/api/visitas/2/cancelar')
        .set('Authorization', `Bearer ${token}`)
        .send({ motivo: 'Cliente ausente' })

      expect(response.status).toBe(200)
      expect(response.body.data.estado).toBe('CANCELADA')
    })
  })
})
