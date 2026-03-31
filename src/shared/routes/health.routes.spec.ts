import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../../app.js'
import { prisma } from '../db/prismaClient.js'

// Para las pruebas de integración en este entorno, mockearemos
// Prisma para no pegarle a la BD real en los tests de readiness.
vi.mock('../db/prismaClient.js', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

describe('Integration Tests - Health Routes', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/health', () => {
    it('debería devolver estado 200 y el estado ok', async () => {
      const response = await request(app).get('/api/health')
      
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'ok')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
    })
  })

  describe('GET /api/ready', () => {
    it('debería responder con 200 ready si base de datos está conectada', async () => {
      // Simulamos que la BD responde ok
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([1] as any)

      const response = await request(app).get('/api/ready')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'ready')
      expect(response.body).toHaveProperty('database', 'connected')
    })

    it('debería responder con 503 error si base de datos falla', async () => {
      // Simulamos que la BD arroja un error
      vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('Connection failed'))

      const response = await request(app).get('/api/ready')

      expect(response.status).toBe(503)
      expect(response.body).toHaveProperty('status', 'error')
      expect(response.body).toHaveProperty('database', 'disconnected')
    })
  })
})
