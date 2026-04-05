import { vi, describe, it, expect, beforeEach } from 'vitest'
import { EmpleadoService } from './empleado.service'
import { EmpleadoRepository } from './empleado.repository'
import bcrypt from 'bcryptjs'

// 1. Mockeamos el repositorio y dependencias externas como bcrypt
vi.mock('./empleado.repository')

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

describe('EmpleadoService - Pruebas Unitarias', () => {
  let empleadoService: EmpleadoService

  beforeEach(() => {
    vi.clearAllMocks()
    empleadoService = new EmpleadoService()
  })

  describe('create()', () => {
    it('debería arrojar error si el CUIL ya está registrado', async () => {
      // Simula que findByCuil encuentra un registro
      const findMock = vi
        .spyOn(EmpleadoRepository.prototype, 'findByCuil')
        .mockResolvedValue({ cuil: '20123456781' } as any)

      await expect(
        empleadoService.create({
          cuil: '20123456781',
          nombre: 'Juan',
          apellido: 'Pérez',
          rol_actual: 'VISITADOR',
          area_trabajo: 'Campo',
        })
      ).rejects.toThrow('Ya existe un empleado con ese CUIL')

      expect(findMock).toHaveBeenCalledWith('20123456781')
    })

    it('debería hashear la contraseña si se proporciona una y crear el empleado', async () => {
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue(null)
      
      const createMock = vi.spyOn(EmpleadoRepository.prototype, 'create').mockResolvedValue({
        cuil: '20123456781',
        nombre: 'Juan',
        apellido: 'Pérez',
        rol_actual: 'VISITADOR',
        area_trabajo: 'Campo',
        contrasenia: 'hashed_pass_mock',
        activo: true,
      } as any)

      // Configuramos el mock de bcrypt para devolver un string simulado
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_pass_mock' as any)

      const result = await empleadoService.create({
        cuil: '20123456781',
        nombre: 'Juan',
        apellido: 'Pérez',
        rol_actual: 'VISITADOR',
        area_trabajo: 'Campo',
        contrasenia: 'mypassword',
      })

      // Verifica que bcrypt fue llamado
      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10)
      
      // Verifica que el repositorio reciba el hash, no la constraseña plana
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ contrasenia: 'hashed_pass_mock' })
      )

      // Verifica que el payload resultante NO contenga la contraseña
      expect(result).not.toHaveProperty('contrasenia')
      expect(result.cuil).toBe('20123456781')
      expect(result.activo).toBe(true)
    })
  })

  describe('findByCuil()', () => {
    it('debería arrojar error si el empleado existe en DB pero no está activo', async () => {
      // Simulamos que el repositorio encuentra el empleado público, pero con activo: false
      const findMock = vi.spyOn(EmpleadoRepository.prototype, 'findByCuilPublic').mockResolvedValue({
        cuil: '111',
        activo: false,
      } as any)

      await expect(empleadoService.findByCuil('111')).rejects.toThrow('Empleado no encontrado o inactivo')
      expect(findMock).toHaveBeenCalledWith('111')
    })
  })

  describe('updatePassword()', () => {
    it('debería arrojar error si la contraseña actual no coincide', async () => {
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue({
        cuil: '123',
        activo: true,
        contrasenia: 'old_hash',
      } as any)

      // Simular bcrypt.compare retornando "false"
      vi.mocked(bcrypt.compare).mockResolvedValue(false as any)

      await expect(
        empleadoService.updatePassword('123', 'wrong_pass', 'new_pass')
      ).rejects.toThrow('La contraseña actual es incorrecta')

      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_pass', 'old_hash')
    })

    it('debería encriptar y guardar la nueva contraseña si coinciden', async () => {
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuil').mockResolvedValue({
        cuil: '123',
        activo: true,
        contrasenia: 'old_hash',
      } as any)

      vi.mocked(bcrypt.compare).mockResolvedValue(true as any)
      vi.mocked(bcrypt.hash).mockResolvedValue('new_hash_mock' as any)
      
      const updateMock = vi.spyOn(EmpleadoRepository.prototype, 'update').mockResolvedValue({} as any)

      await empleadoService.updatePassword('123', 'correct_pass', 'new_pass')

      expect(updateMock).toHaveBeenCalledWith('123', { contrasenia: 'new_hash_mock' })
    })
  })

  describe('remove()', () => {
    it('debería hacer un soft-delete actualizando activo a false', async () => {
      // Simulamos que el empleado es encontrado y está activo
      vi.spyOn(EmpleadoRepository.prototype, 'findByCuilPublic').mockResolvedValue({
        cuil: '999',
        activo: true,
      } as any)

      const updateMock = vi.spyOn(EmpleadoRepository.prototype, 'update').mockResolvedValue({
        cuil: '999',
        activo: false, // se marca inactivo
      } as any)

      const result = await empleadoService.remove('999')

      expect(updateMock).toHaveBeenCalledWith('999', { activo: false })
      expect(result.activo).toBe(false)
    })
  })
})
