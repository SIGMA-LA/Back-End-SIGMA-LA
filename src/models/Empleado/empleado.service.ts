import { EmpleadoRepository } from './empleado.repository.js'
import { empleado } from '@prisma/client'

/**
 * Servicio para manejar la lógica de negocio de empleados.
 * @class EmpleadoService
 * @method create - Crea un nuevo empleado validando que el CUIL no exista.
 * @method findAll - Obtiene todos los empleados.
 * @method findByCuil - Obtiene un empleado por su CUIL.
 * @method update - Actualiza un empleado existente verificando que existe.
 * @method remove - Elimina un empleado por su CUIL verificando que existe.
 * @method count - Cuenta el total de empleados registrados.
 * @returns {Promise<empleado | empleado[] | number | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class EmpleadoService {
  private empleadoRepository: EmpleadoRepository

  constructor() {
    this.empleadoRepository = new EmpleadoRepository()
  }

  // Crear nuevo empleado
  async create(data: {
    cuil: bigint
    nombre: string
    apellido: string
    rol_actual: string
    area_trabajo: string
    contrasenia?: string
  }): Promise<empleado> {
    try {
      const existingEmpleado = await this.empleadoRepository.findByCuil(
        data.cuil,
      )
      if (existingEmpleado) {
        throw new Error('Ya existe un empleado con ese CUIL')
      }

      return await this.empleadoRepository.create(data)
    } catch (error: unknown) {
      throw new Error(
        `Error al crear empleado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    }
  }

  // Obtener todos los empleados
  async findAll(): Promise<empleado[]> {
    try {
      return await this.empleadoRepository.findAll()
    } catch (error: unknown) {
      throw new Error(
        `Error al obtener empleados: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    }
  }

  // Obtener empleado por CUIL
  async findByCuil(cuil: bigint): Promise<empleado | null> {
    try {
      return await this.empleadoRepository.findByCuil(cuil)
    } catch (error: unknown) {
      throw new Error(
        `Error al obtener empleado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    }
  }

  // Actualizar empleado
  async update(
    cuil: bigint,
    data: Partial<{
      nombre: string
      apellido: string
      rol_actual: string
      area_trabajo: string
      contrasenia: string
    }>,
  ): Promise<empleado> {
    try {
      const existingEmpleado = await this.empleadoRepository.findByCuil(cuil)
      if (!existingEmpleado) {
        throw new Error('Empleado no encontrado')
      }

      return await this.empleadoRepository.update(cuil, data)
    } catch (error: unknown) {
      throw new Error(
        `Error al actualizar empleado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    }
  }

  // Eliminar empleado
  async remove(cuil: bigint): Promise<empleado> {
    try {
      const existingEmpleado = await this.empleadoRepository.findByCuil(cuil)
      if (!existingEmpleado) {
        throw new Error('Empleado no encontrado')
      }

      return await this.empleadoRepository.delete(cuil)
    } catch (error: unknown) {
      throw new Error(
        `Error al eliminar empleado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    }
  }

  // Contar total de empleados
  async count(): Promise<number> {
    try {
      return await this.empleadoRepository.count()
    } catch (error: unknown) {
      throw new Error(
        `Error al contar empleados: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      )
    }
  }
}
