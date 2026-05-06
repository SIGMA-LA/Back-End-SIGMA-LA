import { VisitaRepository, VisitaWithRelations } from './visita.repository.js'
import { visita, Prisma } from '@prisma/client'
import { EmpleadoService } from '../Empleado/empleado.service.js'
import { VehiculoService } from '../Vehiculo/vehiculo.service.js'
import { ValidationError } from '../../shared/errors/validationError.js'
import { AppError } from '../../shared/errors/AppError.js'
import { emailService } from '../../shared/providers/email/index.js'
import { eventBus } from '../../shared/events/eventBus.js'
import type { PaginationParams, PaginatedResponse } from '../../shared/types/pagination.js'
import { prisma } from '../../shared/db/prismaClient.js'

/**
 * Interface for creating a new Visita.
 */
interface CreateVisitaData {
  empleados_visita: string[]
  fecha_hora_visita: string
  fechaSalida?: string
  motivo_visita: string
  observaciones?: string
  direccion_visita?: string
  dias_viatico?: number
  nombre_cliente?: string
  apellido_cliente?: string
  telefono_cliente?: string
  cod_obra?: number
  cod_localidad?: number
  vehiculo: string
  fechaHasta?: string
  cod_ops?: number[]
}

/**
 * Service to manage technical visit (visita) operations.
 */
export class VisitaService {
  private visitaRepository: VisitaRepository
  private empleadoService: EmpleadoService
  private vehiculoService: VehiculoService

  constructor() {
    this.visitaRepository = new VisitaRepository()
    this.empleadoService = new EmpleadoService()
    this.vehiculoService = new VehiculoService()
  }

  /**
   * Creates a new technical visit.
   * @param data The visit data.
   * @returns The created visit with relations.
   */
  async create(data: CreateVisitaData): Promise<VisitaWithRelations> {
    const fechaParaPrisma = new Date(data.fecha_hora_visita)
    const fechaFinEstimada = data.fechaHasta
      ? new Date(data.fechaHasta)
      : new Date(
        fechaParaPrisma.getTime() +
        (data.dias_viatico && data.dias_viatico > 0
          ? data.dias_viatico
          : 1) *
        24 *
        60 *
        60 *
        1000,
      )

    const visitaData: Prisma.visitaCreateInput = {
      fecha_hora_visita: fechaParaPrisma,
      motivo_visita: data.motivo_visita || 'OTRO',
      estado: 'PROGRAMADA',
      observaciones: data.observaciones,
      direccion_visita: data.direccion_visita,
      nombre_cliente: data.nombre_cliente,
      apellido_cliente: data.apellido_cliente,
      telefono_cliente: data.telefono_cliente,
      dias_viatico: data.dias_viatico || 1,
      ...(data.cod_obra && {
        obra: { connect: { cod_obra: data.cod_obra } },
      }),
      ...(data.cod_localidad && {
        localidad: { connect: { cod_localidad: data.cod_localidad } },
      }),
      ...(data.empleados_visita && data.empleados_visita.length > 0 && {
        empleado_visita: {
          create: data.empleados_visita.map((cuil: string) => ({ cuil })),
        },
      }),
      ...(data.vehiculo && {
        uso_vehiculo_visita: {
          create: {
            vehiculo: {
              connect: {
                patente: data.vehiculo,
              },
            },
            fecha_hora_ini_uso: new Date(
              data.fechaSalida || data.fecha_hora_visita,
            ),
            fecha_hora_fin_est: fechaFinEstimada,
          },
        },
      }),
      ...(data.cod_ops && data.cod_ops.length > 0 && {
        ordenes_de_produccion: {
          connect: data.cod_ops.map((cod_op) => ({ cod_op })),
        },
      }),
    }

    // Availability validation before creation
    const fIni = new Date(data.fechaSalida || data.fecha_hora_visita)
    const fFin = fechaFinEstimada

    const checks: Promise<string | null>[] = []
    if (data.empleados_visita && data.empleados_visita.length > 0) {
      checks.push(
        this.empleadoService
          .verificarDisponibilidadEmpleados(data.empleados_visita, fIni, fFin)
          .then(() => null)
          .catch((err: Error) => err.message),
      )
    }
    if (data.vehiculo) {
      checks.push(
        this.vehiculoService
          .verificarDisponibilidadVehiculos([data.vehiculo], fIni, fFin)
          .then(() => null)
          .catch((err: Error) => err.message),
      )
    }

    const results = await Promise.all(checks)
    const errMessages = results.filter(
      (msg): msg is string => typeof msg === 'string',
    )
    if (errMessages.length > 0) {
      throw new ValidationError(
        `Se detectaron sobreposiciones de agenda:\n${errMessages.join('\n')}`,
        'CONFLICTO_AGENDA',
      )
    }

    const visita = await this.visitaRepository.create(visitaData)

    if (data.empleados_visita && data.empleados_visita.length > 0) {
      eventBus.emit('visita.asignada', { visita, cuils: data.empleados_visita })
    }

    // Email notification: Try to find recipient (Obra -> Cliente -> Email or Fallback in text fields)
    let emailDestino: string | null = null;

    // 1. Try to get email directly from Obra -> Cliente relation
    if (visita.obra?.cliente?.mail) {
      emailDestino = visita.obra.cliente.mail;
    }

    // 2. If no email in client or no obra linked, search for literal email in notes or address
    if (!emailDestino) {
      const textToSearch = `${data.observaciones || ''} ${data.direccion_visita || ''}`;
      const emailMatch = textToSearch.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      emailDestino = emailMatch ? emailMatch[0] : null;
    }

    if (emailDestino) {
      const nombreDestino = data.nombre_cliente || visita.obra?.cliente?.nombre || 'Cliente';
      const motivo = data.motivo_visita || 'Visita Técnica';

      emailService.sendNotification(
        emailDestino,
        `Confirmación de Visita Técnica - SIGMA-LA - ${motivo}`,
        `Hola ${nombreDestino},<br><br>` +
        `Le informamos que se ha programado una visita técnica para el día <b>${fechaParaPrisma.toLocaleString()}</b>.<br>` +
        `Motivo: <b>${motivo}</b><br>` +
        `Dirección: ${data.direccion_visita || visita.obra?.direccion || 'A coordinar'}<br><br>` +
        `Saludos,<br>Equipo de SIGMA-LA`
      ).catch(err => console.error('Error sending automatic visit email:', err));
    }

    return visita
  }

  /**
   * Gets all visits, optionally filtered by status, with pagination
   */
  async findAll(
    estado?: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<VisitaWithRelations>> {
    const { data, total } = await this.visitaRepository.findAll(estado, pagination)

    if (!pagination) {
      return { data, total, totalPages: 1, page: 1, pageSize: Math.max(total, 1) }
    }

    const totalPages = Math.ceil(total / pagination.pageSize) || 1

    return {
      data,
      total,
      totalPages,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }

  /**
   * Gets a visit by its ID.
   */
  async findById(cod_visita: number): Promise<VisitaWithRelations> {
    const visita = await this.visitaRepository.findById(cod_visita)
    if (!visita) {
      throw new AppError('Visita no encontrada', 404, 'VISITA_NOT_FOUND')
    }
    return visita
  }

  /**
   * Searches for visits with pagination and status filter.
   */
  async buscar(
    q: string,
    pagination: PaginationParams,
    estado?: string,
  ): Promise<PaginatedResponse<VisitaWithRelations>> {
    const { data, total } = await this.visitaRepository.buscar(q, pagination, estado)

    const totalPages = Math.ceil(total / pagination.pageSize) || 1

    return {
      data,
      total,
      totalPages,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }

  /**
   * Updates an existing visit.
   */
  async update(
    cod_visita: number,
    data: {
      fecha_hora_visita?: string
      cod_obra?: number
      cod_localidad?: number
      motivo_visita?: string
      estado?: string
      observaciones?: string
      direccion_visita?: string
      fecha_cancelacion?: string
      empleados_visita?: string[]
      vehiculo?: string
      dias_viatico?: number
      fechaHasta?: string
      fechaSalida?: string
    },
  ): Promise<VisitaWithRelations> {
    const existingVisita = await this.findById(cod_visita)

    const {
      cod_obra,
      cod_localidad,
      fecha_hora_visita,
      fecha_cancelacion,
      empleados_visita,
      vehiculo,
      dias_viatico,
      fechaHasta,
      fechaSalida,
      ...simpleFields
    } = data

    // 1. Date change detection
    const newFechaInicio = fecha_hora_visita ? new Date(fecha_hora_visita) : new Date(existingVisita.fecha_hora_visita)
    const vUsage = existingVisita.uso_vehiculo_visita?.[0]
    const curFechaSalida = vUsage ? new Date(vUsage.fecha_hora_ini_uso) : new Date(existingVisita.fecha_hora_visita)
    const curFechaRetorno = vUsage ? new Date(vUsage.fecha_hora_fin_est) : new Date(new Date(existingVisita.fecha_hora_visita).getTime() + (existingVisita.dias_viatico || 1) * 24 * 60 * 60 * 1000)

    const newFechaSalida = fechaSalida ? new Date(fechaSalida) : curFechaSalida
    const newFechaRetorno = fechaHasta ? new Date(fechaHasta) : curFechaRetorno

    const hasDatesChanged =
      newFechaInicio.getTime() !== new Date(existingVisita.fecha_hora_visita).getTime() ||
      newFechaSalida.getTime() !== curFechaSalida.getTime() ||
      newFechaRetorno.getTime() !== curFechaRetorno.getTime()

    // 2. Assignment change detection
    const hasPersonnelChanged = !!empleados_visita && (
      empleados_visita.length !== existingVisita.empleado_visita.length ||
      empleados_visita.some(cuil => !existingVisita.empleado_visita.find((ev) => ev.cuil === cuil))
    )

    const hasVehicleChanged = !!vehiculo && (
      !vUsage || vehiculo !== vUsage.patente
    )

    // 3. Conditional availability validations
    if (hasDatesChanged || hasPersonnelChanged || hasVehicleChanged) {
      const cuilesToValidate = empleados_visita || existingVisita.empleado_visita.map((ev) => ev.cuil)
      const vehiculoToValidate = vehiculo || (vUsage ? vUsage.patente : undefined)

      const checks: Promise<string | null>[] = []
      if (cuilesToValidate.length > 0) {
        checks.push(
          this.empleadoService
            .verificarDisponibilidadEmpleados(cuilesToValidate, newFechaSalida, newFechaRetorno, cod_visita)
            .then(() => null)
            .catch((err: Error) => err.message)
        )
      }
      if (vehiculoToValidate) {
        checks.push(
          this.vehiculoService
            .verificarDisponibilidadVehiculos([vehiculoToValidate], newFechaSalida, newFechaRetorno, cod_visita)
            .then(() => null)
            .catch((err: Error) => err.message)
        )
      }

      const results = await Promise.all(checks)
      const errMessages = results.filter((msg): msg is string => typeof msg === 'string')
      if (errMessages.length > 0) {
        throw new ValidationError(
          `Se detectaron sobreposiciones de agenda:\n${errMessages.join('\n')}`,
          'CONFLICTO_AGENDA'
        )
      }
    }

    // 4. Update payload preparation
    const updateData: Prisma.visitaUpdateInput = {
      ...simpleFields,
      ...(fecha_hora_visita && { fecha_hora_visita: newFechaInicio }),
      ...(fecha_cancelacion && { fecha_cancelacion: new Date(fecha_cancelacion) }),
      ...(dias_viatico !== undefined && { dias_viatico }),
    }

    if (hasPersonnelChanged && empleados_visita) {
      updateData.empleado_visita = {
        deleteMany: {},
        create: empleados_visita.map(cuil => ({ cuil })),
      }
    }

    if (hasVehicleChanged || (hasDatesChanged && vUsage)) {
      updateData.uso_vehiculo_visita = {
        deleteMany: {},
        create: {
          vehiculo: { connect: { patente: vehiculo || (vUsage ? vUsage.patente : '') } },
          fecha_hora_ini_uso: newFechaSalida,
          fecha_hora_fin_est: newFechaRetorno,
        },
      }
    }

    if (cod_obra !== undefined) {
      updateData.obra = cod_obra === null ? { disconnect: true } : { connect: { cod_obra } }
    }

    if (cod_localidad !== undefined) {
      updateData.localidad = cod_localidad === null ? { disconnect: true } : { connect: { cod_localidad } }
    }

    const updatedVisita = await this.visitaRepository.update(cod_visita, updateData)

    if (hasPersonnelChanged && empleados_visita) {
      const newlyAssignedCuils = empleados_visita.filter(cuil => !existingVisita.empleado_visita.find(ev => ev.cuil === cuil))
      if (newlyAssignedCuils.length > 0) {
        eventBus.emit('visita.asignada', { visita: updatedVisita, cuils: newlyAssignedCuils })
      }

      const removedCuils = existingVisita.empleado_visita.filter(ev => !empleados_visita.includes(ev.cuil)).map(ev => ev.cuil)
      if (removedCuils.length > 0) {
        eventBus.emit('visita.actualizada', { visita: updatedVisita, cuils: removedCuils, tipo: 'DESASIGNADO' })
      }
    }

    if (hasDatesChanged) {
      const remainingCuils = updatedVisita.empleado_visita.map(ev => ev.cuil)
      if (remainingCuils.length > 0) {
        eventBus.emit('visita.actualizada', { visita: updatedVisita, cuils: remainingCuils, tipo: 'HORARIO_MODIFICADO' })
      }
    }

    return updatedVisita
  }

  /**
   * Deletes a visit by ID.
   */
  async remove(cod_visita: number): Promise<visita> {
    await this.findById(cod_visita)
    return await this.visitaRepository.remove(cod_visita)
  }

  /**
   * Gets visits by status.
   */
  async findByEstado(estado: string): Promise<VisitaWithRelations[]> {
    return await this.visitaRepository.findByEstado(estado)
  }

  /**
   * Gets visits associated with an obra.
   */
  async findByObra(cod_obra: number): Promise<VisitaWithRelations[]> {
    return await this.visitaRepository.findByObra(cod_obra)
  }

  /**
   * Gets visits for a specific employee and set of statuses.
   */
  async getVisitasByEmpleadoAndEstado(
    cuil: string,
    estado: string[] | string,
    search?: string,
    date?: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<VisitaWithRelations>> {
    const estadosArray = Array.isArray(estado) ? estado : [estado]
    const { data, total } = await this.visitaRepository.findByEmpleadoAndEstado(
      cuil,
      estadosArray,
      search,
      date,
      pagination,
    )

    if (!pagination) {
      return { data, total, totalPages: 1, page: 1, pageSize: Math.max(total, 1) }
    }

    const totalPages = Math.ceil(total / pagination.pageSize) || 1
    return { data, total, totalPages, page: pagination.page, pageSize: pagination.pageSize }
  }

  /**
   * Gets all visits for a specific employee.
   */
  async getVisitasByEmpleado(
    cuil: string,
    estados?: string[],
    search?: string,
    date?: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<VisitaWithRelations>> {
    const { data, total } = await this.visitaRepository.findByEmpleado(
      cuil,
      estados,
      search,
      date,
      pagination,
    )

    if (!pagination) {
      return { data, total, totalPages: 1, page: 1, pageSize: Math.max(total, 1) }
    }

    const totalPages = Math.ceil(total / pagination.pageSize) || 1
    return { data, total, totalPages, page: pagination.page, pageSize: pagination.pageSize }
  }

  /**
   * Finalizes a visit by changing status to COMPLETADA.
   */
  async finalizar(cod_visita: number, observaciones?: string): Promise<VisitaWithRelations> {
    await this.findById(cod_visita)

    const updateData: Prisma.visitaUpdateInput = {
      estado: 'COMPLETADA',
      ...(observaciones && { observaciones })
    }

    const visitaCompletada = await this.visitaRepository.update(cod_visita, updateData)

    // Notify coordination using events
    eventBus.emit('visita.finalizada', visitaCompletada)

    return visitaCompletada
  }

  /**
   * Cancels a visit by changing status to CANCELADA.
   */
  async cancelar(cod_visita: number, motivo?: string): Promise<VisitaWithRelations> {
    await this.findById(cod_visita)

    const updateData: Prisma.visitaUpdateInput = {
      estado: 'CANCELADA',
      fecha_cancelacion: new Date(),
      ...(motivo && { observaciones: `Visita cancelada: ${motivo}` })
    }

    const canceledVisita = await this.visitaRepository.update(cod_visita, updateData)

    const assignedCuils = canceledVisita.empleado_visita?.map(ev => ev.cuil) || []
    if (assignedCuils.length > 0) {
      eventBus.emit('visita.actualizada', { visita: canceledVisita, cuils: assignedCuils, tipo: 'CANCELADA' })
    }

    return canceledVisita
  }

  /**
   * Obtiene estadísticas de visitas programadas y completadas para hoy.
   */
  async getProgresoDiario(): Promise<{ agendaHoyVisitas: number; completadosHoyVisitas: number }> {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const agendaHoyVisitas = await prisma.visita.count({
      where: {
        fecha_hora_visita: { gte: todayStart, lte: todayEnd },
        estado: { not: 'CANCELADA' },
      },
    })

    const completadosHoyVisitas = await prisma.visita.count({
      where: {
        fecha_hora_visita: { gte: todayStart, lte: todayEnd },
        estado: 'COMPLETADA',
      },
    })

    return { agendaHoyVisitas, completadosHoyVisitas }
  }

  /**
   * Obtiene prospectos (visitas de medición inicial sin obra).
   */
  async getProspectos(estado?: string, pagination?: PaginationParams): Promise<PaginatedResponse<VisitaWithRelations>> {
    const { data, total } = await this.visitaRepository.findProspectos(estado, pagination)

    if (!pagination) {
      return { data, total, totalPages: 1, page: 1, pageSize: Math.max(total, 1) }
    }

    const totalPages = Math.ceil(total / pagination.pageSize) || 1

    return {
      data,
      total,
      totalPages,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }
}


export const visitaService = new VisitaService()

