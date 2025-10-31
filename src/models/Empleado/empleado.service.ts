import { EmpleadoRepository } from './empleado.repository.js'
import bcrypt from 'bcryptjs'

/**
 * Servicio para manejar la lógica de negocio de empleados.
 * @class EmpleadoService
 * @method create - Crea un nuevo empleado validando que el CUIL no exista.
 * @method findAll - Obtiene todos los empleados activos.
 * @method findByCuil - Obtiene un empleado activo por su CUIL.
 * @method update - Actualiza un empleado existente verificando que existe.
 * @method remove - Desactiva un empleado (soft delete).
 * @method count - Cuenta el total de empleados activos.
 * @returns {Promise<EmpleadoPayload | EmpleadoPayload[] | number | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */

export interface EmpleadoPayload {
  cuil: string
  nombre: string
  apellido: string
  rol_actual: string
  area_trabajo: string
  activo: boolean
}

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
    contrasenia?: string
  }): Promise<EmpleadoPayload> {
    const existingEmpleado = await this.empleadoRepository.findByCuil(data.cuil)
    if (existingEmpleado) {
      throw new Error('Ya existe un empleado con ese CUIL')
    }

    // Si se proporciona contraseña, hashearla. Si no, dejar en null
    const hashedPassword = data.contrasenia
      ? await bcrypt.hash(data.contrasenia, 10)
      : null

    const empleado = await this.empleadoRepository.create({
      cuil: data.cuil,
      nombre: data.nombre,
      apellido: data.apellido,
      rol_actual: data.rol_actual,
      area_trabajo: data.area_trabajo,
      contrasenia: hashedPassword,
    })

    // Retornar sin la contraseña
    return {
      cuil: empleado.cuil,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      rol_actual: empleado.rol_actual,
      area_trabajo: empleado.area_trabajo,
      activo: empleado.activo,
    }
  }

  async findVisitadores(): Promise<EmpleadoPayload[]> {
    return await this.empleadoRepository.findByCriteriaPublic({
      rol_actual: 'VISITADOR',
      activo: true,
    })
  }

  // Obtener todos los empleados activos
  async findAll(): Promise<EmpleadoPayload[]> {
    return await this.empleadoRepository.findAllPublic()
  }

  // Obtener empleado por CUIL
  async findByCuil(cuil: string): Promise<EmpleadoPayload | null> {
    const empleado = await this.empleadoRepository.findByCuilPublic(cuil)
    if (!empleado) {
      return null
    }
    // Verificar que esté activo
    if (!empleado.activo) {
      return null
    }
    return empleado
  }

  async findDisponiblesParaEntrega(): Promise<EmpleadoPayload[]> {
    return await this.empleadoRepository.findByCriteriaPublic({
      OR: [{ rol_actual: 'VISITADOR' }, { rol_actual: 'PLANTA' }],
      activo: true,
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
  ): Promise<EmpleadoPayload> {
    const existingEmpleado =
      await this.empleadoRepository.findByCuilPublic(cuil)
    if (!existingEmpleado || !existingEmpleado.activo) {
      throw new Error('Empleado no encontrado')
    }

    // Si se proporciona contraseña, hashearla
    const updateData = data.contrasenia
      ? { ...data, contrasenia: await bcrypt.hash(data.contrasenia, 10) }
      : data

    const empleado = await this.empleadoRepository.update(cuil, updateData)

    // Retornar sin la contraseña
    return {
      cuil: empleado.cuil,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      rol_actual: empleado.rol_actual,
      area_trabajo: empleado.area_trabajo,
      activo: empleado.activo,
    }
  }

  // Soft delete - Desactivar empleado
  async remove(cuil: string): Promise<EmpleadoPayload> {
    const existingEmpleado = await this.empleadoRepository.findByCuil(cuil)
    if (!existingEmpleado || !existingEmpleado.activo) {
      throw new Error('Empleado no encontrado')
    }

    const empleado = await this.empleadoRepository.update(cuil, {
      activo: false,
    })

    // Retornar sin la contraseña
    return {
      cuil: empleado.cuil,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      rol_actual: empleado.rol_actual,
      area_trabajo: empleado.area_trabajo,
      activo: empleado.activo,
    }
  }

  // Contar total de empleados activos
  async count(): Promise<number> {
    return await this.empleadoRepository.count()
  }
}
