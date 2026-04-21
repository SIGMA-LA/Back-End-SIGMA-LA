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
      await expect(obraService.solicitarStock(99)).rejects.toThrow('Obra no encontrada (ID: 99)')
    })

    it('debería fallar si el estado no es PAGADA PARCIALMENTE', async () => {
      vi.spyOn(ObraRepository.prototype, 'findById').mockResolvedValue({
        cod_obra: 1,
        estado: 'PENDIENTE',
      } as unknown as Awaited<ReturnType<ObraRepository['findById']>>)
      await expect(obraService.solicitarStock(1)).rejects.toThrow('Solo se puede solicitar stock para obras con pago parcial.')
    })

    it('debería cambiar a EN ESPERA DE STOCK exitosamente', async () => {
      vi.spyOn(ObraRepository.prototype, 'findById').mockResolvedValue({
        cod_obra: 1,
        estado: 'PAGADA PARCIALMENTE',
      } as unknown as Awaited<ReturnType<ObraRepository['findById']>>)

      const updateMock = vi.spyOn(ObraRepository.prototype, 'update').mockResolvedValue({
        cod_obra: 1,
        estado: 'EN ESPERA DE STOCK',
      } as unknown as Awaited<ReturnType<ObraRepository['update']>>)

      await obraService.solicitarStock(1)
      expect(updateMock).toHaveBeenCalledWith(1, { estado: 'EN ESPERA DE STOCK' })
    })
  })

  describe('recibirStock()', () => {
    it('debería fallar si el estado no es EN ESPERA DE STOCK', async () => {
      vi.spyOn(ObraRepository.prototype, 'findById').mockResolvedValue({
        cod_obra: 1,
        estado: 'PENDIENTE',
      } as unknown as Awaited<ReturnType<ObraRepository['findById']>>)
      await expect(obraService.recibirStock(1)).rejects.toThrow('Esta obra no está esperando stock.')
    })

    it('debería cambiar a EN PRODUCCION exitosamente', async () => {
      vi.spyOn(ObraRepository.prototype, 'findById').mockResolvedValue({
        cod_obra: 2,
        estado: 'EN ESPERA DE STOCK',
      } as unknown as Awaited<ReturnType<ObraRepository['findById']>>)

      const updateMock = vi.spyOn(ObraRepository.prototype, 'update').mockResolvedValue({
        cod_obra: 2,
        estado: 'EN PRODUCCION',
      } as unknown as Awaited<ReturnType<ObraRepository['update']>>)

      await obraService.recibirStock(2)
      expect(updateMock).toHaveBeenCalledWith(2, { estado: 'EN PRODUCCION' })
    })
  })

  describe('create() / update() validación de fechas', () => {
    it('debería transformar fecha de string ISO corto a Date al crear obra', async () => {
      const createMock = vi.spyOn(ObraRepository.prototype, 'create').mockResolvedValue({} as unknown as Awaited<ReturnType<ObraRepository['create']>>)

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

    it('debería transformar fechas YYYY-MM-DD en presupuesto.create al crear obra', async () => {
      const createMock = vi.spyOn(ObraRepository.prototype, 'create').mockResolvedValue({} as unknown as Awaited<ReturnType<ObraRepository['create']>>)

      await obraService.create({
        direccion: 'Rosario 120',
        fecha_ini: '2026-04-30' as unknown as Date,
        estado: 'EN ESPERA DE PAGO',
        cliente: {
          create: undefined,
          connectOrCreate: undefined,
          connect: undefined,
        },
        localidad: {
          create: undefined,
          connectOrCreate: undefined,
          connect: undefined,
        },
        presupuesto: {
          create: [
            {
              valor: 10,
              fecha_emision: '2026-04-20',
              fecha_aceptacion: '2026-04-20',
            },
          ],
        },
      } as any)

      const createArg = createMock.mock.calls[0]?.[0] as any
      expect(createArg.presupuesto.create).toEqual([
        expect.objectContaining({
          valor: 10,
          fecha_emision: new Date('2026-04-20T00:00:00.000Z'),
          fecha_aceptacion: new Date('2026-04-20T00:00:00.000Z'),
        }),
      ])
    })
  })

  describe('findAll() - Paginación', () => {
    it('debería retornar PaginatedResponse con metadata correcta', async () => {
      vi.spyOn(ObraRepository.prototype, 'findAll').mockResolvedValue({
        data: [
          { cod_obra: 1, direccion: 'Calle 1', estado: 'ACTIVA' },
          { cod_obra: 2, direccion: 'Calle 2', estado: 'EN PRODUCCION' },
        ] as unknown as Awaited<ReturnType<ObraRepository['findAll']>>['data'],
        total: 50,
      })

      const result = await obraService.findAll({ page: 1, pageSize: 25 })

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({ cod_obra: 1 }),
          expect.objectContaining({ cod_obra: 2 }),
        ]),
        total: 50,
        totalPages: 2,
        page: 1,
        pageSize: 25,
      })
    })

    it('debería calcular totalPages correctamente con valores no exactos', async () => {
      vi.spyOn(ObraRepository.prototype, 'findAll').mockResolvedValue({
        data: [],
        total: 51,
      })

      const result = await obraService.findAll({ page: 1, pageSize: 25 })

      expect(result.totalPages).toBe(3) // ceil(51/25) = 3
      expect(result.total).toBe(51)
    })

    it('debería pasar los parámetros de paginación al repositorio', async () => {
      const findAllMock = vi.spyOn(ObraRepository.prototype, 'findAll').mockResolvedValue({
        data: [],
        total: 0,
      })

      await obraService.findAll({ page: 3, pageSize: 10 })

      expect(findAllMock).toHaveBeenCalledWith({ page: 3, pageSize: 10 })
    })
  })
})
