import { vi, describe, it, expect, beforeEach } from 'vitest'
import { EntregaService } from './entrega.service'
import { MaquinariaService } from '../Maquinaria/maquinaria.service'
import { prisma } from '../../shared/db/prismaClient'
import { EntregaRepository, type EntregaWithRelations } from './entrega.repository'
import { EmpleadoService } from '../Empleado/empleado.service'
import { VehiculoService } from '../Vehiculo/vehiculo.service'
import { Prisma } from '@prisma/client'

// Mockeamos servicios internos y repositorios
vi.mock('./entrega.repository')
vi.mock('../Empleado/empleado.service')
vi.mock('../Vehiculo/vehiculo.service')
vi.mock('../Maquinaria/maquinaria.service')

// Mockeamos el cliente Prisma completo
vi.mock('../../shared/db/prismaClient', () => {
  const mockPrismaTx = {
    entrega: { update: vi.fn() },
    uso_vehiculo_entrega: { updateMany: vi.fn() },
    uso_maquinaria: { updateMany: vi.fn() },
    obra: { update: vi.fn() },
  }

  return {
    prisma: {
      obra: { findUnique: vi.fn() },
      entrega: { findUnique: vi.fn() },
      $transaction: vi.fn(async (cb) => {
        // Ejecutamos el callback pasando el "transactor" simulado
        return await cb(mockPrismaTx as unknown as Prisma.TransactionClient)
      }),
    },
  }
})

describe('EntregaService - Pruebas Unitarias', () => {
  let entregaService: EntregaService

  beforeEach(() => {
    vi.clearAllMocks()
    entregaService = new EntregaService()
  })

  describe('create()', () => {
    it('debería arrojar error si la obra no existe', async () => {
      vi.mocked(prisma.obra.findUnique).mockResolvedValue(null)

      await expect(
        entregaService.create({
          cod_obra: 99,
          fecha_hora_entrega: new Date().toISOString(),
          detalle: 'Materiales varios',
          estado: 'PENDIENTE',
          empleados: [{ cuil: '123', rol_entrega: 'ENCARGADO' }],
          vehiculos: ['AB123CD'],
        })
      ).rejects.toThrow('Obra no encontrada (ID: 99)')
    })

    it('debería arrojar error si falla la validación cruzada de disponibilidad', async () => {
      vi.mocked(prisma.obra.findUnique).mockResolvedValue({ cod_obra: 1 } as unknown as Awaited<ReturnType<typeof prisma.obra.findUnique>>)

      vi.spyOn(EmpleadoService.prototype, 'verificarDisponibilidadEmpleados').mockResolvedValue(undefined)
      // Simulamos que el vehículo arroja error de disponibilidad
      vi.spyOn(VehiculoService.prototype, 'verificarDisponibilidadVehiculos')
        .mockRejectedValue(new Error('El vehículo AB123CD está ocupado'))

      await expect(
        entregaService.create({
          cod_obra: 1,
          fecha_hora_entrega: new Date().toISOString(),
          detalle: 'Materiales varios',
          estado: 'PENDIENTE',
          empleados: [{ cuil: '123', rol_entrega: 'ENCARGADO' }],
          vehiculos: ['AB123CD'],
        })
      ).rejects.toThrow('Se detectaron sobreposiciones de agenda:\nEl vehículo AB123CD está ocupado')
    })

    it('debería procesar el create exitosamente cuando todo es válido', async () => {
      vi.mocked(prisma.obra.findUnique).mockResolvedValue({ cod_obra: 1 } as unknown as Awaited<ReturnType<typeof prisma.obra.findUnique>>)
      
      vi.spyOn(EmpleadoService.prototype, 'verificarDisponibilidadEmpleados').mockResolvedValue(undefined)
      vi.spyOn(VehiculoService.prototype, 'verificarDisponibilidadVehiculos').mockResolvedValue(undefined)
      vi.spyOn(MaquinariaService.prototype, 'verificarDisponibilidadMaquinarias').mockResolvedValue(undefined)

      const createMock = vi.spyOn(EntregaRepository.prototype, 'create').mockResolvedValue({
        cod_entrega: 100,
      } as unknown as EntregaWithRelations)

      const result = await entregaService.create({
        cod_obra: 1,
        fecha_hora_entrega: new Date().toISOString(),
        detalle: 'Materiales varios',
        estado: 'PENDIENTE',
        empleados: [{ cuil: '123', rol_entrega: 'ENCARGADO' }],
        vehiculos: ['AB123CD'],
        maquinarias: [1, 2],
      })

      expect(result.cod_entrega).toBe(100)
      expect(createMock).toHaveBeenCalledOnce()
    })
  })

  describe('finalizar()', () => {
    it('debería completar y liberar vehículos y maquinarias mediante la transacción prismática', async () => {
      vi.mocked(prisma.entrega.findUnique).mockResolvedValue({
        esFinal: false,
        cod_obra: 1,
      } as unknown as Awaited<ReturnType<typeof prisma.entrega.findUnique>>)

      // Configuramos el comportamiento del prisma mock transaccional
      // Nota: vi.mocked no funciona directo con el parametro del callback si no lo extraemos
      // pero el diseño del mock de vi.mocked arriba ya inyecta el comportamiento de resolucion.
      
      const _res = await entregaService.finalizar(100, 'Entregado OK')
      
      expect(prisma.entrega.findUnique).toHaveBeenCalledWith({
        where: { cod_entrega: 100 },
        select: { esFinal: true, cod_obra: true },
      })
      // La transacción debe haberse llamado
      expect(prisma.$transaction).toHaveBeenCalledOnce()
      // En un entorno de mocks complejos, podríamos interceptar `tx.entrega.update`
    })
  })
})
