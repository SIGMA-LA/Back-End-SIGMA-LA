import { vi, describe, it, expect, beforeEach } from 'vitest'
import { VisitaService } from './visita.service'
import { VisitaRepository, type VisitaWithRelations } from './visita.repository'
import { EmpleadoService } from '../Empleado/empleado.service'
import { VehiculoService } from '../Vehiculo/vehiculo.service'
import { ValidationError } from '../../shared/errors/validationError'

vi.mock('./visita.repository')
vi.mock('../Empleado/empleado.service')
vi.mock('../Vehiculo/vehiculo.service')

describe('VisitaService - Pruebas Unitarias', () => {
  let visitaService: VisitaService

  beforeEach(() => {
    vi.clearAllMocks()
    visitaService = new VisitaService()
  })

  describe('create()', () => {
    it('debería arrojar error si hay sobreposición de agenda de empleados o vehículos', async () => {
      // Configuramos el rechazo en EmpleadoService para simular ocupación
      vi.spyOn(
        EmpleadoService.prototype,
        'verificarDisponibilidadEmpleados'
      ).mockRejectedValue(new ValidationError('El empleado Juan ya tiene asignada otra visita'))

      // VehiculoService pasa bien
      vi.spyOn(
        VehiculoService.prototype,
        'verificarDisponibilidadVehiculos'
      ).mockResolvedValue(undefined)

      await expect(
        visitaService.create({
          empleados_visita: ['20111111112'],
          fecha_hora_visita: new Date().toISOString(),
          motivo_visita: 'Medición',
          vehiculo: 'AB123CD',
        })
      ).rejects.toThrow(/Conflictos de agenda:\n• El empleado Juan ya tiene asignada otra visita/)
    })

    it('debería crear correctamente si no hay conflictos', async () => {
      vi.spyOn(EmpleadoService.prototype, 'verificarDisponibilidadEmpleados').mockResolvedValue(undefined)
      vi.spyOn(VehiculoService.prototype, 'verificarDisponibilidadVehiculos').mockResolvedValue(undefined)
      
      const createMock = vi.spyOn(VisitaRepository.prototype, 'create').mockResolvedValue({
        cod_visita: 10,
        motivo_visita: 'Medición',
      } as unknown as VisitaWithRelations)

      const result = await visitaService.create({
        empleados_visita: ['20111111112'],
        fecha_hora_visita: new Date().toISOString(),
        motivo_visita: 'Medición',
        vehiculo: 'AB123CD',
      })

      expect(result.cod_visita).toBe(10)
      expect(createMock).toHaveBeenCalledOnce()
    })
  })

  describe('finalizar()', () => {
    it('debería finalizar actualizando el estado a COMPLETADA y agregar observaciones', async () => {
      vi.spyOn(VisitaRepository.prototype, 'findById').mockResolvedValue({
        cod_visita: 5,
        estado: 'PROGRAMADA'
      } as unknown as VisitaWithRelations)

      const updateMock = vi.spyOn(VisitaRepository.prototype, 'update').mockResolvedValue({
        cod_visita: 5,
        estado: 'COMPLETADA',
        observaciones: 'Todo correcto'
      } as unknown as VisitaWithRelations)

      const result = await visitaService.finalizar(5, 'Todo correcto')

      expect(updateMock).toHaveBeenCalledWith(5, {
        estado: 'COMPLETADA',
        observaciones: 'Todo correcto'
      })
      expect(result.estado).toBe('COMPLETADA')
    })
  })

  describe('cancelar()', () => {
    it('debería cancelar actualizando el estado a CANCELADA y grabar motivo', async () => {
      vi.spyOn(VisitaRepository.prototype, 'findById').mockResolvedValue({
        cod_visita: 8,
      } as unknown as VisitaWithRelations)

      const updateMock = vi.spyOn(VisitaRepository.prototype, 'update').mockResolvedValue({
        cod_visita: 8,
        estado: 'CANCELADA',
      } as unknown as VisitaWithRelations)

      await visitaService.cancelar(8, 'Cliente no estaba')

      expect(updateMock).toHaveBeenCalledWith(
        8,
        expect.objectContaining({
          estado: 'CANCELADA',
          observaciones: 'Visita cancelada: Cliente no estaba'
        })
      )
    })
  })
})
