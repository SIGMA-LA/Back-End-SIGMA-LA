import { EmpleadoRepository } from './empleado.repository.js'
import { empleado } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
    cuil: string
    nombre: string
    apellido: string
    rol_actual: string
    area_trabajo: string
    contrasenia: string
  }): Promise<empleado> {
    const existingEmpleado = await this.empleadoRepository.findByCuil(data.cuil)
    if (existingEmpleado) {
      throw new Error('Ya existe un empleado con ese CUIL')
    }
    const hashedPassword = await bcrypt.hash(data.contrasenia, 10)
    return await this.empleadoRepository.create({
      ...data,
      contrasenia: hashedPassword,
    })
  }

  // Obtener todos los empleados
  async findAll(): Promise<empleado[]> {
    return await this.empleadoRepository.findAll()
  }

  // Obtener empleado por CUIL
  async findByCuil(cuil: string): Promise<empleado | null> {
    return await this.empleadoRepository.findByCuil(cuil)
  }

  async findDisponiblesParaEntrega(): Promise<empleado[]> {
    return await this.empleadoRepository.findByCriteria({
      OR: [
        { rol_actual: 'VISITADOR' },
        { rol_actual: 'PLANTA' },
      ],
    })
  }

  // Actualizar empleado
  async update(
    cuil: string,
    data: Partial<{
      nombre: string
      apellido: string
      rol_actual: string
      area_trabajo: string
      contrasenia?: string
    }>,
  ): Promise<empleado> {
    const existingEmpleado = await this.empleadoRepository.findByCuil(cuil)
    if (!existingEmpleado) {
      throw new Error('Empleado no encontrado')
    }
    if (data.contrasenia) {
      data.contrasenia = await bcrypt.hash(data.contrasenia, 10)
    }
    return await this.empleadoRepository.update(cuil, data)
  }

  // Eliminar empleado
  async remove(cuil: string): Promise<empleado> {
    const existingEmpleado = await this.empleadoRepository.findByCuil(cuil)
    if (!existingEmpleado) {
      throw new Error('Empleado no encontrado')
    }
    return await this.empleadoRepository.delete(cuil)
  }

  // Contar total de empleados
  async count(): Promise<number> {
    return await this.empleadoRepository.count()
  }
}
