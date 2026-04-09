import { EmpleadoRepository } from './empleado.repository.js'
import bcrypt from 'bcryptjs'
import { ValidationError } from '../../shared/errors/validationError.js'
import { type empleado, Prisma } from '@prisma/client'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Servicio para manejar la lógica de negocio de empleados.
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
  config_produccion?: ConfigProduccionUpdate | null
  config_visitador?: ConfigVisitadorUpdate | null
  config_planta?: ConfigPlantaUpdate | null
}

export interface ConfigCoordinacionUpdate {
  visita_completada?: boolean
  nueva_orden_produccion?: boolean
  cambio_estado?: boolean
  pago_completo_obra?: boolean
}

export interface ConfigProduccionUpdate {
  orden_aprobada?: boolean
}

export interface ConfigVisitadorUpdate {
  asignacion_visita?: boolean
  actualizacion_visita?: boolean
}

export interface ConfigPlantaUpdate {
  asignacion_visita?: boolean
  asignacion_entrega?: boolean
  actualizacion_visita?: boolean
}

export interface NotificationMetadata {
  configuracion: {
    canales: { id: string; label: string }[]
    eventos: { id: string; label: string }[]
  }
  valores: Record<string, boolean>
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
      throw new AppError('Ya existe un empleado con ese CUIL', 409, 'CONFLICTO_CUIL')
    }

    // Si se proporciona contraseña, hashearla. Si no, dejar en null
    const hashedPassword = data.contrasenia
      ? await bcrypt.hash(data.contrasenia, 10)
      : null

    const empleadoResult = await this.empleadoRepository.create({
      cuil: data.cuil,
      nombre: data.nombre,
      apellido: data.apellido,
      rol_actual: data.rol_actual,
      area_trabajo: data.area_trabajo,
      contrasenia: hashedPassword,
    })

    return {
      cuil: empleadoResult.cuil,
      nombre: empleadoResult.nombre,
      apellido: empleadoResult.apellido,
      rol_actual: empleadoResult.rol_actual,
      area_trabajo: empleadoResult.area_trabajo,
      activo: empleadoResult.activo,
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

  async getPerfil(cuil: string): Promise<EmpleadoPayload & { notificaciones: NotificationMetadata }> {
    const empleadoResult = await this.empleadoRepository.findPerfil(cuil)
    if (!empleadoResult) {
      throw new AppError('Empleado no encontrado', 404, 'EMPLEADO_NOT_FOUND')
    }

    const notificacionesMetadata = this.getNotificationMetadata(
      empleadoResult.rol_actual,
      empleadoResult as unknown as EmpleadoPayload,
      empleadoResult.config_coordinacion,
      (empleadoResult as any).config_produccion,
      (empleadoResult as any).config_visitador,
      (empleadoResult as any).config_planta
    )

    const result: any = {
      cuil: empleadoResult.cuil,
      nombre: empleadoResult.nombre,
      apellido: empleadoResult.apellido,
      rol_actual: empleadoResult.rol_actual,
      area_trabajo: empleadoResult.area_trabajo,
      mail: empleadoResult.mail,
      activo: empleadoResult.activo,
    }

    // Ocultar los campos de la DB que ya están mapeados en 'notificaciones' para evitar redundancia
    delete (result as any).config_coordinacion;
    delete (result as any).config_produccion;
    delete (result as any).config_visitador;
    delete (result as any).config_planta;
    delete (result as any).notificacion_email;
    delete (result as any).notificacion_whatsapp;

    return {
      ...result,
      notificaciones: notificacionesMetadata
    }
  }

  private getNotificationMetadata(
    rol: string,
    empleadoData: EmpleadoPayload,
    valuesCoord?: ConfigCoordinacionUpdate | null,
    valuesProd?: ConfigProduccionUpdate | null,
    valuesVisit?: ConfigVisitadorUpdate | null,
    valuesPlanta?: ConfigPlantaUpdate | null
  ): NotificationMetadata {
    const metadata: NotificationMetadata = {
      configuracion: {
        canales: [],
        eventos: []
      },
      valores: {}
    }

    if (rol === 'COORDINACION') {
      metadata.configuracion.eventos = [
        { id: 'visita_completada', label: 'Visita Técnica Completada' },
        { id: 'nueva_orden_produccion', label: 'Nueva Orden de Producción' },
        { id: 'cambio_estado', label: 'Cambios de estado en las obras' },
        { id: 'pago_completo_obra', label: 'Pago completo de la obra' }
      ]

      metadata.configuracion.canales = [
        { id: 'email', label: 'Recibir por Email' },
        { id: 'whatsapp', label: 'Recibir por WhatsApp' }
      ]

      metadata.valores = {
        visita_completada: valuesCoord?.visita_completada || false,
        nueva_orden_produccion: valuesCoord?.nueva_orden_produccion || false,
        cambio_estado: valuesCoord?.cambio_estado || false,
        pago_completo_obra: valuesCoord?.pago_completo_obra || false,
        email: empleadoData.notificacion_email || false,
        whatsapp: empleadoData.notificacion_whatsapp || false
      }
    } else if (rol === 'PRODUCCION') {
      metadata.configuracion.eventos = [
        { id: 'orden_aprobada', label: 'Notificación de Orden Aprobada' }
      ]

      metadata.configuracion.canales = [
        { id: 'email', label: 'Recibir por Email' },
        { id: 'whatsapp', label: 'Recibir por WhatsApp' }
      ]

      metadata.valores = {
        orden_aprobada: valuesProd?.orden_aprobada || false,
        email: empleadoData.notificacion_email || false,
        whatsapp: empleadoData.notificacion_whatsapp || false
      }
    } else if (rol === 'VISITADOR') {
      metadata.configuracion.eventos = [
        { id: 'asignacion_visita', label: 'Notificación de Asignación de Visita' },
        { id: 'actualizacion_visita', label: 'Notificación de Actualización de Visita' }
      ]

      metadata.configuracion.canales = [
        { id: 'email', label: 'Recibir por Email' },
        { id: 'whatsapp', label: 'Recibir por WhatsApp' }
      ]

      metadata.valores = {
        asignacion_visita: valuesVisit?.asignacion_visita || false,
        actualizacion_visita: valuesVisit?.actualizacion_visita || false,
        email: empleadoData.notificacion_email || false,
        whatsapp: empleadoData.notificacion_whatsapp || false
      }
    } else if (rol === 'PLANTA') {
      metadata.configuracion.eventos = [
        { id: 'asignacion_visita', label: 'Asignación a Visita' },
        { id: 'asignacion_entrega', label: 'Asignación a Entrega' },
        { id: 'actualizacion_visita', label: 'Actualización/Cancelación de Visita' }
      ]

      metadata.configuracion.canales = [
        { id: 'email', label: 'Recibir por Email' },
        { id: 'whatsapp', label: 'Recibir por WhatsApp' }
      ]

      metadata.valores = {
        asignacion_visita: valuesPlanta?.asignacion_visita || false,
        asignacion_entrega: valuesPlanta?.asignacion_entrega || false,
        actualizacion_visita: valuesPlanta?.actualizacion_visita || false,
        email: empleadoData.notificacion_email || false,
        whatsapp: empleadoData.notificacion_whatsapp || false
      }
    }

    return metadata
  }

  // Obtener empleado por CUIL
  async findByCuil(cuil: string): Promise<EmpleadoPayload> {
    const empleadoResult = await this.empleadoRepository.findByCuilPublic(cuil)
    if (!empleadoResult || !empleadoResult.activo) {
      throw new AppError('Empleado no encontrado o inactivo', 404, 'EMPLEADO_NOT_FOUND')
    }
    return empleadoResult
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

    const thirtyDaysAgo = new Date(
      fechaInicio.getTime() - 30 * 24 * 60 * 60 * 1000,
    )
    const empleadosConUsos = await this.empleadoRepository.findUsagesInRange(
      cuiles,
      thirtyDaysAgo,
    )

    const empleadosEnConflicto: string[] = []

    for (const emp of empleadosConUsos) {
      let hayConflicto = false

      for (const ee of emp.entrega_empleado) {
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

      if (!hayConflicto) {
        for (const ev of emp.empleado_visita) {
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
        empleadosEnConflicto.push(`${emp.nombre} ${emp.apellido}`)
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
      mail?: string | null
      contrasenia?: string
    }>,
  ): Promise<EmpleadoPayload> {
    await this.findByCuil(cuil) // Throws if not found

    const updateData = data.contrasenia
      ? { ...data, contrasenia: await bcrypt.hash(data.contrasenia, 10) }
      : data

    const empleadoResult = await this.empleadoRepository.update(cuil, updateData)

    return {
      cuil: empleadoResult.cuil,
      nombre: empleadoResult.nombre,
      apellido: empleadoResult.apellido,
      rol_actual: empleadoResult.rol_actual,
      area_trabajo: empleadoResult.area_trabajo,
      activo: empleadoResult.activo,
    }
  }

  // Actualizar contraseña
  async updatePassword(
    cuil: string,
    currentPass: string,
    newPass: string,
  ): Promise<void> {
    const empleadoResult = await this.empleadoRepository.findByCuil(cuil)
    if (!empleadoResult || !empleadoResult.activo) {
      throw new AppError('Empleado no encontrado', 404, 'EMPLEADO_NOT_FOUND')
    }

    if (!empleadoResult.contrasenia) {
      throw new AppError('El empleado no posee una contraseña configurable', 400, 'NO_PASSWORD_CONFIGURABLE')
    }

    const isMatch = await bcrypt.compare(currentPass, empleadoResult.contrasenia)
    if (!isMatch) {
      throw new AppError('La contraseña actual es incorrecta', 401, 'INVALID_PASSWORD')
    }

    const hashedNew = await bcrypt.hash(newPass, 10)
    await this.empleadoRepository.update(cuil, { contrasenia: hashedNew })
  }

  // Soft delete - Desactivar empleado
  async remove(cuil: string): Promise<EmpleadoPayload> {
    await this.findByCuil(cuil) // Throws if not found

    const empleadoResult = await this.empleadoRepository.update(cuil, {
      activo: false,
    })

    return {
      cuil: empleadoResult.cuil,
      nombre: empleadoResult.nombre,
      apellido: empleadoResult.apellido,
      rol_actual: empleadoResult.rol_actual,
      area_trabajo: empleadoResult.area_trabajo,
      activo: empleadoResult.activo,
    }
  }

  // Contar total de empleados activos
  async count(): Promise<number> {
    return await this.empleadoRepository.count()
  }

  async updateNotifications(
    cuil: string,
    rol: string,
    notifications: Record<string, boolean>,
  ): Promise<empleado> {
    await this.findByCuil(cuil) // Throws if not found

    const { email, whatsapp, ...eventos } = notifications;

    // We use a structured object that matches what the repository expects (Prisma.empleadoUpdateInput)
    // but we use a type cast to the base Prisma input type to satisfy the compiler if needed,
    // while ensuring we only use valid fields from our schema.
    const updateContainer: Prisma.empleadoUpdateInput = {};

    if (email !== undefined) (updateContainer as Record<string, unknown>).notificacion_email = email;
    if (whatsapp !== undefined) (updateContainer as Record<string, unknown>).notificacion_whatsapp = whatsapp;

    if (rol === 'COORDINACION') {
      (updateContainer as Record<string, unknown>).config_coordinacion = {
        upsert: {
          create: eventos,
          update: eventos,
        },
      };
    } else if (rol === 'PRODUCCION') {
      (updateContainer as Record<string, unknown>).config_produccion = {
        upsert: {
          create: eventos,
          update: eventos,
        },
      };
    } else if (rol === 'VISITADOR') {
      (updateContainer as Record<string, unknown>).config_visitador = {
        upsert: {
          create: eventos,
          update: eventos,
        },
      };
    } else if (rol === 'PLANTA') {
      (updateContainer as Record<string, unknown>).config_planta = {
        upsert: {
          create: eventos,
          update: eventos,
        },
      };
    }

    return await this.empleadoRepository.update(cuil, updateContainer)
  }
}


