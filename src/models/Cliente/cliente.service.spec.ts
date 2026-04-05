import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ClienteService } from './cliente.service'
import { ClienteRepository } from './cliente.repository'

// 1. Mockeamos el módulo completo del repositorio
vi.mock('./cliente.repository')

describe('ClienteService - Pruebas Unitarias', () => {
  let clienteService: ClienteService

  beforeEach(() => {
    // 2. Limpia el estado de los mocks antes de cada test
    vi.clearAllMocks()

    // 3. Al instanciar, automáticamente se usará el mock de ClienteRepository
    clienteService = new ClienteService()
  })

  describe('create()', () => {
    it('debería arrojar un error si el cliente ya existe', async () => {
      // spyOn al prototipo permite interceptar la llamada del mock dentro del servicio
      const findByIdMock = vi
        .spyOn(ClienteRepository.prototype, 'findById')
        .mockResolvedValue({ cuil: '20123456789', razon_social: 'Empresa Test' } as any)

      // Verificamos que al crear arroje el mensaje de error esperado
      await expect(
        clienteService.create({ cuil: '20123456789', razon_social: 'Empresa Test' } as any)
      ).rejects.toThrow('Ya existe un cliente con el mismo CUIL.')

      // Verificamos que se haya llamado a findById
      expect(findByIdMock).toHaveBeenCalledWith('20123456789')
    })

    it('debería crear y devolver el cliente si el CUIL no está registrado', async () => {
      // Devolvemos (null) indicando que no existe
      vi.spyOn(ClienteRepository.prototype, 'findById').mockResolvedValue(null)
      
      const createMock = vi
        .spyOn(ClienteRepository.prototype, 'create')
        .mockResolvedValue({ cuil: '20123456789', razon_social: 'Empresa Test' } as any)

      const nuevoCliente = await clienteService.create({
        cuil: '20123456789',
        razon_social: 'Empresa Test'
      } as any)

      // Verificamos el resultado del llamado
      expect(nuevoCliente.cuil).toBe('20123456789')
      expect(nuevoCliente.razon_social).toBe('Empresa Test')

      // Verificamos que el método de creación se haya invocado internamente
      expect(createMock).toHaveBeenCalledOnce()
    })
  })

  describe('remove()', () => {
    it('debería arrojar AppError si el cuil no existe', async () => {
      vi.spyOn(ClienteRepository.prototype, 'findById').mockResolvedValue(null)

      await expect(clienteService.remove('invalido')).rejects.toThrow('Cliente no encontrado')
    })

    it('debería arrojar AppError si el cliente tiene registros asociados', async () => {
      // Simulamos que el cliente sí existe
      vi.spyOn(ClienteRepository.prototype, 'findById').mockResolvedValue({ cuil: '111' } as any)
      
      // Simulamos que al contar relaciones, arroja un número mayor a cero en `obras`
      vi.spyOn(ClienteRepository.prototype, 'countDeleteDependencies').mockResolvedValue({
        obras: 2,
        visitasConObra: 1,
        visitasInicialesSinObra: 0
      })

      await expect(clienteService.remove('111')).rejects.toThrow('No se puede eliminar el cliente porque tiene obras o visitas asociadas')
    })

    it('debería eliminar el cliente cuando no hay dependencias', async () => {
      vi.spyOn(ClienteRepository.prototype, 'findById').mockResolvedValue({ cuil: '111', razon_social: 'Borrar' } as any)
      // Sin dependencias
      vi.spyOn(ClienteRepository.prototype, 'countDeleteDependencies').mockResolvedValue({
        obras: 0,
        visitasConObra: 0,
        visitasInicialesSinObra: 0
      })
      // Simulamos el borrado
      const deleteMock = vi.spyOn(ClienteRepository.prototype, 'delete').mockResolvedValue({
        cuil: '111',
        razon_social: 'Borrar'
      } as any)

      await clienteService.remove('111')

      expect(deleteMock).toHaveBeenCalledWith('111')
    })
  })
})
