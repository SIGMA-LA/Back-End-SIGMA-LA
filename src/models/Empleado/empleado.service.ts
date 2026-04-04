import { EmpleadoRepository } from './empleado.repository.js'
import bcrypt from 'bcryptjs'
import { ValidationError } from '../../shared/errors/validationError.js'
import { type empleado, Prisma } from '@prisma/client'

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
  mail?: string | null
  notificacion_email?: boolean
  notificacion_whatsapp?: boolean
  config_coordinacion?: ConfigCoordinacionUpdate | null
}

export interface ConfigCoordinacionUpdate {
  visita_completada?: boolean
  nueva_orden_produccion?: boolean
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
      throw new ValidationError('Ya existe un empleado con ese CUIL', 'CONFLICTO_CUIL')
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

  async getPerfil(cuil: string): Promise<any | null> {
    const empleado = await this.empleadoRepository.findPerfil(cuil)
    if (!empleado) return null

    // Generar metadata dinámicamente según el rol
    const notificacionesMetadata = this.getNotificationMetadata(
      empleado.rol_actual, 
      empleado as any, 
      empleado.config_coordinacion
    )

    // Ocultar los campos de la DB que ya están mapeados en 'notificaciones' para evitar redundancia
    const { 
      config_coordinacion, 
      notificacion_email, 
      notificacion_whatsapp, 
      ...frontendData 
    } = empleado

    return {
      ...frontendData,
      notificaciones: notificacionesMetadata
    }
  }

  private getNotificationMetadata(rol: string, empleado: EmpleadoPayload, values?: ConfigCoordinacionUpdate | null) {
    // Configuración base por defecto
    const metadata = {
      configuracion: {
        canales: [] as { id: string; label: string }[],
        eventos: [] as { id: string; label: string }[]
      },
      valores: {} as Record<string, boolean>
    }

    if (rol === 'COORDINACION') {
      metadata.configuracion.eventos = [
        { id: 'visita_completada', label: 'Visita Técnica Completada' },
        { id: 'nueva_orden_produccion', label: 'Nueva Orden de Producción' }
      ]

      metadata.configuracion.canales = [
        { id: 'email', label: 'Recibir por Email' },
        { id: 'whatsapp', label: 'Recibir por WhatsApp' }
      ]
      
      // Valores actuales de la DB
      metadata.valores = {
        visita_completada: values?.visita_completada || false,
        nueva_orden_produccion: values?.nueva_orden_produccion || false,
        email: empleado.notificacion_email || false,
        whatsapp: empleado.notificacion_whatsapp || false
      }
    }

    return metadata
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

  async verificarDisponibilidadEmpleados(
    cuiles: string[],
    fechaInicio: Date,
    fechaFin: Date,
    excludeCodVisita?: number,
    excludeCodEntrega?: number,
  ): Promise<void> {
    if (cuiles.length === 0) return

    // Buscar usos desde 30 días atrás por si hay entregas o visitas muy largas
    const thirtyDaysAgo = new Date(
      fechaInicio.getTime() - 30 * 24 * 60 * 60 * 1000,
    )
    const empleadosConUsos = await this.empleadoRepository.findUsagesInRange(
      cuiles,
      thirtyDaysAgo,
    )

    const empleadosEnConflicto: string[] = []

    for (const empleado of empleadosConUsos) {
      let hayConflicto = false

      // Check entregas
      for (const ee of empleado.entrega_empleado) {
        const entrega = ee.entrega
        if (!entrega) continue
        if (excludeCodEntrega && entrega.cod_entrega === excludeCodEntrega)
          continue

        const ini = new Date(entrega.fecha_hora_entrega)
        const dias =
          entrega.dias_viaticos && entrega.dias_viaticos > 0
            ? entrega.dias_viaticos
            : 1
        const fin = new Date(ini.getTime() + dias * 24 * 60 * 60 * 1000)

        if (ini < fechaFin && fechaInicio < fin) {
          hayConflicto = true
          break
        }
      }

      // Check visitas
      if (!hayConflicto) {
        for (const ev of empleado.empleado_visita) {
          const visita = ev.visita
          if (!visita) continue
          if (excludeCodVisita && visita.cod_visita === excludeCodVisita)
            continue

          const ini = new Date(visita.fecha_hora_visita)
          const dias =
            visita.dias_viatico && visita.dias_viatico > 0
              ? visita.dias_viatico
              : 1
          const fin = new Date(ini.getTime() + dias * 24 * 60 * 60 * 1000)

          if (ini < fechaFin && fechaInicio < fin) {
            hayConflicto = true
            break
          }
        }
      }

      if (hayConflicto) {
        empleadosEnConflicto.push(`${empleado.nombre} ${empleado.apellido}`)
      }
    }

    if (empleadosEnConflicto.length > 0) {
      throw new ValidationError(
        `Conflicto de personal. Los siguientes empleados ya tienen asignada otra obra o visita en la fecha solicitada: ${empleadosEnConflicto.join(', ')}`,
        'CONFLICTO_PERSONAL',
      )
    }
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

  // Actualizar contraseña
  async updatePassword(
    cuil: string,
    currentPass: string,
    newPass: string,
  ): Promise<void> {
    const empleado = await this.empleadoRepository.findByCuil(cuil)
    if (!empleado || !empleado.activo) {
      throw new Error('Empleado no encontrado')
    }

    if (!empleado.contrasenia) {
      throw new Error('El empleado no posee una contraseña configurable')
    }

    const isMatch = await bcrypt.compare(currentPass, empleado.contrasenia)
    if (!isMatch) {
      throw new Error('La contraseña actual es incorrecta')
    }

    const hashedNew = await bcrypt.hash(newPass, 10)
    await this.empleadoRepository.update(cuil, { contrasenia: hashedNew })
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

  async updateNotifications(
    cuil: string,
    rol: string,
    notifications: any,
  ): Promise<empleado> {
    const empleado = await this.empleadoRepository.findByCuil(cuil)
    if (!empleado || !empleado.activo) {
      throw new Error('Empleado no encontrado')
    }

    const { email, whatsapp, ...eventos } = notifications;
    const data: Prisma.empleadoUpdateInput = {}

    // Actualizamos campos globales del empleado si se envían
    if (email !== undefined) data.notificacion_email = email;
    if (whatsapp !== undefined) data.notificacion_whatsapp = whatsapp;

    // Lógica por rol para decidir qué tabla de configuración actualizar
    if (rol === 'COORDINACION') {
      data.config_coordinacion = {
        upsert: {
          create: eventos as Prisma.config_coordinacionCreateWithoutEmpleadoInput,
          update: eventos as Prisma.config_coordinacionUpdateWithoutEmpleadoInput,
        },
      }
    }

    return await this.empleadoRepository.update(cuil, data)
  }
}
