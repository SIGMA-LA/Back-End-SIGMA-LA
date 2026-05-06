import { EmpleadoRepository } from './empleado.repository.js'
import bcrypt from 'bcryptjs'
import { ValidationError } from '../../shared/errors/validationError.js'
import { type empleado, type entrega, type visita, type uso_vehiculo_entrega, type uso_vehiculo_visita, Prisma } from '@prisma/client'
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
  config_ventas?: ConfigVentasUpdate | null
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

export interface ConfigVentasUpdate {
  obra_produccion?: boolean
  obra_pedido_stock?: boolean
  obra_produccion_final?: boolean
  obra_entregada?: boolean
}

export interface NotificationMetadata {
  configuracion: {
    canales: { id: string; label: string }[]
    eventos: { id: string; label: string }[]
  }
  valores: Record<string, boolean>
}

interface EntregaConUso extends entrega {
  uso_vehiculo_entrega?: uso_vehiculo_entrega[]
}

interface VisitaConUso extends visita {
  uso_vehiculo_visita?: uso_vehiculo_visita[]
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
    const cuilNormalized = data.cuil.replace(/-/g, '')
    const existingEmpleado = await this.empleadoRepository.findByCuil(cuilNormalized)
    if (existingEmpleado) {
      throw new AppError('Ya existe un empleado con ese CUIL', 409, 'CONFLICTO_CUIL')
    }

    // Si se proporciona contraseña, hashearla. Si no, dejar en null
    const hashedPassword = data.contrasenia
      ? await bcrypt.hash(data.contrasenia, 10)
      : null

    const empleadoResult = await this.empleadoRepository.create({
      cuil: cuilNormalized,
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
      (empleadoResult as unknown as { config_coordinacion?: ConfigCoordinacionUpdate | null }).config_coordinacion,
      (empleadoResult as unknown as { config_produccion?: ConfigProduccionUpdate | null }).config_produccion,
      (empleadoResult as unknown as { config_visitador?: ConfigVisitadorUpdate | null }).config_visitador,
      (empleadoResult as unknown as { config_planta?: ConfigPlantaUpdate | null }).config_planta,
      (empleadoResult as unknown as { config_ventas?: ConfigVentasUpdate | null }).config_ventas
    )

    const result: EmpleadoPayload & { notificaciones: NotificationMetadata } = {
      cuil: empleadoResult.cuil,
      nombre: empleadoResult.nombre,
      apellido: empleadoResult.apellido,
      rol_actual: empleadoResult.rol_actual,
      area_trabajo: empleadoResult.area_trabajo,
      mail: empleadoResult.mail,
      activo: empleadoResult.activo,
      notificaciones: notificacionesMetadata
    }

    return result
  }

  private getNotificationMetadata(
    rol: string,
    empleadoData: EmpleadoPayload,
    valuesCoord?: ConfigCoordinacionUpdate | null,
    valuesProd?: ConfigProduccionUpdate | null,
    valuesVisit?: ConfigVisitadorUpdate | null,
    valuesPlanta?: ConfigPlantaUpdate | null,
    valuesVentas?: ConfigVentasUpdate | null
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
    } else if (rol === 'VENTAS') {
      metadata.configuracion.eventos = [
        { id: 'obra_produccion', label: 'Obra enviada a producción' },
        { id: 'obra_pedido_stock', label: 'Obra como pedido de stock' },
        { id: 'obra_produccion_final', label: 'Obra con producción terminada' },
        { id: 'obra_entregada', label: 'Obra entregada' }
      ]

      metadata.configuracion.canales = [
        { id: 'email', label: 'Recibir por Email' },
        { id: 'whatsapp', label: 'Recibir por WhatsApp' }
      ]

      metadata.valores = {
        obra_produccion: valuesVentas?.obra_produccion || false,
        obra_pedido_stock: valuesVentas?.obra_pedido_stock || false,
        obra_produccion_final: valuesVentas?.obra_produccion_final || false,
        obra_entregada: valuesVentas?.obra_entregada || false,
        email: empleadoData.notificacion_email || false,
        whatsapp: empleadoData.notificacion_whatsapp || false
      }
    }

    return metadata
  }

  // Obtener empleado por CUIL
  async findByCuil(cuil: string, allowInactive: boolean = false): Promise<EmpleadoPayload> {
    const empleadoResult = await this.empleadoRepository.findByCuilPublic(cuil)
    if (!empleadoResult) {
      throw new AppError('Empleado no encontrado', 404, 'EMPLEADO_NOT_FOUND')
    }
    if (!empleadoResult.activo && !allowInactive) {
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

    const empleadosInactivos = empleadosConUsos.filter((emp) => !emp.activo)
    if (empleadosInactivos.length > 0) {
      const inactivosNames = empleadosInactivos.map((emp) => `${emp.nombre} ${emp.apellido}`).join(', ')
      throw new AppError(`Los siguientes empleados se encuentran inactivos: ${inactivosNames}`, 400, 'EMPLEADO_INACTIVO')
    }

    const empleadosEnConflicto: string[] = []

    for (const emp of empleadosConUsos) {
      let hayConflicto = false

      for (const ee of emp.entrega_empleado) {
        const entrega = ee.entrega as EntregaConUso
        if (!entrega) continue
        if (excludeCodEntrega && entrega.cod_entrega === excludeCodEntrega)
          continue

        const vUsage = entrega.uso_vehiculo_entrega?.[0]
        let ini = new Date(entrega.fecha_hora_entrega)
        let fin: Date

        if (vUsage) {
          ini = new Date(vUsage.fecha_hora_ini_uso)
          fin = new Date(vUsage.fecha_hora_ini_est || vUsage.fecha_hora_fin_real || entrega.fecha_hora_entrega)
        } else {
          const dias = entrega.dias_viaticos && entrega.dias_viaticos > 0 ? entrega.dias_viaticos : 1
          fin = new Date(ini.getTime() + dias * 24 * 60 * 60 * 1000)
        }

        if (ini < fechaFin && fechaInicio < fin) {
          hayConflicto = true
          break
        }
      }

      if (!hayConflicto) {
        for (const ev of emp.empleado_visita) {
          const visita = ev.visita as VisitaConUso
          if (!visita) continue
          if (excludeCodVisita && visita.cod_visita === excludeCodVisita)
            continue

          const vUsage = visita.uso_vehiculo_visita?.[0]
          if (!visita.fecha_hora_visita) continue

          let ini = new Date(visita.fecha_hora_visita)
          let fin: Date

          if (vUsage) {
            ini = new Date(vUsage.fecha_hora_ini_uso)
            fin = new Date(vUsage.fecha_hora_fin_est || vUsage.fecha_hora_fin_real || (visita.fecha_hora_visita ? visita.fecha_hora_visita : ini))
          } else {
            const dias = visita.dias_viatico && visita.dias_viatico > 0 ? visita.dias_viatico : 1
            fin = new Date(ini.getTime() + dias * 24 * 60 * 60 * 1000)
          }

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
      activo?: boolean
    }>,
  ): Promise<EmpleadoPayload> {
    const empleado = await this.findByCuil(cuil, true) // Allow inactive to update them

    const updateData = data.contrasenia
      ? { ...data, contrasenia: await bcrypt.hash(data.contrasenia, 10) }
      : data

    const empleadoResult = await this.empleadoRepository.update(empleado.cuil, updateData)

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
    await this.empleadoRepository.update(empleadoResult.cuil, { contrasenia: hashedNew })
  }

  // Soft delete - Desactivar empleado
  async remove(cuil: string): Promise<EmpleadoPayload> {
    const empleado = await this.findByCuil(cuil) // Throws if not found

    const empleadoResult = await this.empleadoRepository.update(empleado.cuil, {
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
    const empleado = await this.findByCuil(cuil) // Throws if not found

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
    } else if (rol === 'VENTAS') {
      (updateContainer as Record<string, unknown>).config_ventas = {
        upsert: {
          create: eventos,
          update: eventos,
        },
      };
    }

    return await this.empleadoRepository.update(empleado.cuil, updateContainer)
  }
}


