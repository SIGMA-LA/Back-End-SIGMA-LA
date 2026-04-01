import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ObraService } from './obra.service'
import { ObraRepository } from './obra.repository'

vi.mock('./obra.repository')

describe('ObraService - Pruebas Unitarias', () => {
  let obraService: ObraService

  beforeEach(() => {
    vi.clearAllMocks()
    obraService = new ObraService()
  })

  describe('solicitarStock()', () => {
    it('debería fallar si la obra no existe', async () => {
      vi.spyOn(ObraRepository.prototype, 'findById').mockResolvedValue(null)
      await expect(obraService.solicitarStock(99)).rejects.toThrow('Obra no encontrada.')
    })

    it('debería fallar si el estado no es PAGADA PARCIALMENTE', async () => {
      vi.spyOn(ObraRepository.prototype, 'findById').mockResolvedValue({
        cod_obra: 1,
        estado: 'PENDIENTE',
      } as any)
      await expect(obraService.solicitarStock(1)).rejects.toThrow('Solo se puede solicitar stock para obras con pago parcial.')
    })

    it('debería cambiar a EN ESPERA DE STOCK exitosamente', async () => {
      vi.spyOn(ObraRepository.prototype, 'findById').mockResolvedValue({
        cod_obra: 1,
        estado: 'PAGADA PARCIALMENTE',
      } as any)

      const updateMock = vi.spyOn(ObraRepository.prototype, 'update').mockResolvedValue({
        cod_obra: 1,
        estado: 'EN ESPERA DE STOCK',
      } as any)

      await obraService.solicitarStock(1)
      expect(updateMock).toHaveBeenCalledWith(1, { estado: 'EN ESPERA DE STOCK' })
    })
  })

  describe('recibirStock()', () => {
    it('debería fallar si el estado no es EN ESPERA DE STOCK', async () => {
      vi.spyOn(ObraRepository.prototype, 'findById').mockResolvedValue({
        cod_obra: 1,
        estado: 'PENDIENTE',
      } as any)
      await expect(obraService.recibirStock(1)).rejects.toThrow('Esta obra no está esperando stock.')
    })

    it('debería cambiar a EN PRODUCCION exitosamente', async () => {
      vi.spyOn(ObraRepository.prototype, 'findById').mockResolvedValue({
        cod_obra: 2,
        estado: 'EN ESPERA DE STOCK',
      } as any)

      const updateMock = vi.spyOn(ObraRepository.prototype, 'update').mockResolvedValue({
        cod_obra: 2,
        estado: 'EN PRODUCCION',
      } as any)

      await obraService.recibirStock(2)
      expect(updateMock).toHaveBeenCalledWith(2, { estado: 'EN PRODUCCION' })
    })
  })

  describe('create() / update() validación de fechas', () => {
    it('debería transformar fecha de string ISO corto a Date al crear obra', async () => {
      const createMock = vi.spyOn(ObraRepository.prototype, 'create').mockResolvedValue({} as any)

      await obraService.create({
        direccion: 'Calle Falsa 123',
        fecha_ini: '2026-05-15' as unknown as Date,
        estado: '',
        localidad: {
          create: undefined,
          connectOrCreate: undefined,
          connect: undefined
        },
        cliente: {
          create: undefined,
          connectOrCreate: undefined,
          connect: undefined
        }
      })

      // Comprueba que date haya hecho apend de "T00:00:00.000Z"
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          fecha_ini: new Date('2026-05-15T00:00:00.000Z')
        })
      )
    })
  })
})
