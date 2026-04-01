import { VisitaRepository, VisitaWithRelations } from './visita.repository.js'
import { visita, Prisma } from '@prisma/client'
import { EmpleadoService } from '../Empleado/empleado.service.js'
import { VehiculoService } from '../Vehiculo/vehiculo.service.js'
import { ValidationError } from '../../shared/errors/validationError.js'

/**
 * Servicio para manejar la lógica de negocio de visitas.
 * @class VisitaService
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
}

export class VisitaService {
  private visitaRepository: VisitaRepository
  private empleadoService: EmpleadoService
  private vehiculoService: VehiculoService

  constructor() {
    this.visitaRepository = new VisitaRepository()
    this.empleadoService = new EmpleadoService()
    this.vehiculoService = new VehiculoService()
  }

  // Crear nueva visita
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
      empleado_visita: {
        create: data.empleados_visita.map((cuil: string) => ({ cuil })),
      },
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
    }

    // Validar disponibilidad antes de crear
    const fIni = new Date(data.fechaSalida || data.fecha_hora_visita)
    const fFin = fechaFinEstimada

    const checks = []
    if (data.empleados_visita.length > 0) {
      checks.push(
        this.empleadoService
          .verificarDisponibilidadEmpleados(data.empleados_visita, fIni, fFin)
          .catch((err: Error) => err.message),
      )
    }
    if (data.vehiculo) {
      checks.push(
        this.vehiculoService
          .verificarDisponibilidadVehiculos([data.vehiculo], fIni, fFin)
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

    return await this.visitaRepository.create(visitaData)
  }

  // Obtener todas las visitas
  async findAll(estado?: string): Promise<VisitaWithRelations[]> {
    return await this.visitaRepository.findAll(estado)
  }

  // Obtener visita por cod_visita
  async findById(cod_visita: number): Promise<VisitaWithRelations | null> {
    return await this.visitaRepository.findById(cod_visita)
  }

  // Obtener visitas paginadas con búsqueda
  async buscar(
    q: string,
    page = 1,
    pageSize = 25,
    estado?: string,
  ): Promise<VisitaWithRelations[]> {
    return await this.visitaRepository.buscar(
      q,
      pageSize,
      (Math.max(1, page) - 1) * Math.max(1, Math.min(100, pageSize)),
      estado,
    )
  }

  // Actualizar visita
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
    const existingVisita = await this.visitaRepository.findById(cod_visita)
    if (!existingVisita) {
      throw new ValidationError('Visita no encontrada')
    }

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

    // 1. Detección de cambios en fechas
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

    // 2. Detección de cambios en asignaciones
    const hasPersonnelChanged = !!empleados_visita && (
      empleados_visita.length !== existingVisita.empleado_visita.length ||
      empleados_visita.some(cuil => !existingVisita.empleado_visita.find((ev) => ev.cuil === cuil))
    )

    const hasVehicleChanged = !!vehiculo && (
      !vUsage || vehiculo !== vUsage.patente
    )

    // 3. Validaciones de disponibilidad condicionales
    if (hasDatesChanged || hasPersonnelChanged || hasVehicleChanged) {
      const cuilesToValidate = empleados_visita || existingVisita.empleado_visita.map((ev) => ev.cuil)
      const vehiculoToValidate = vehiculo || (vUsage ? vUsage.patente : undefined)

      const checks = []
      if (cuilesToValidate.length > 0) {
        checks.push(this.empleadoService.verificarDisponibilidadEmpleados(cuilesToValidate, newFechaSalida, newFechaRetorno, cod_visita).catch((err: Error) => err.message))
      }
      if (vehiculoToValidate) {
        checks.push(this.vehiculoService.verificarDisponibilidadVehiculos([vehiculoToValidate], newFechaSalida, newFechaRetorno, cod_visita).catch((err: Error) => err.message))
      }

      const results = await Promise.all(checks)
      const errMessages = results.filter((msg): msg is string => typeof msg === 'string')
      if (errMessages.length > 0) throw new ValidationError(`Se detectaron sobreposiciones de agenda:\n${errMessages.join('\n')}`, 'CONFLICTO_AGENDA')
    }

    // 4. Preparación de actualización
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

    return await this.visitaRepository.update(cod_visita, updateData)
  }

  // Eliminar visita
  async remove(cod_visita: number): Promise<visita> {
    const existingVisita = await this.visitaRepository.findById(cod_visita)
    if (!existingVisita) {
      throw new ValidationError('Visita no encontrada')
    }
    return await this.visitaRepository.remove(cod_visita)
  }

  // Obtener visitas por estado
  async findByEstado(estado: string): Promise<VisitaWithRelations[]> {
    return await this.visitaRepository.findByEstado(estado)
  }

  // Obtener visitas por obra
  async findByObra(cod_obra: number): Promise<VisitaWithRelations[]> {
    return await this.visitaRepository.findByObra(cod_obra)
  }

  async getVisitasByEmpleadoAndEstado(
    cuil: string,
    estado: string[] | string,
    search?: string,
    date?: string,
  ): Promise<VisitaWithRelations[]> {
    const estadosArray = Array.isArray(estado) ? estado : [estado]
    return await this.visitaRepository.findByEmpleadoAndEstado(
      cuil,
      estadosArray,
      search,
      date,
    )
  }

  // Obtener todas las visitas de un empleado
  async getVisitasByEmpleado(
    cuil: string,
    estados?: string[],
    search?: string,
    date?: string,
  ): Promise<VisitaWithRelations[]> {
    return await this.visitaRepository.findByEmpleado(
      cuil,
      estados,
      search,
      date,
    )
  }

  // Obtener visitas asociadas a una obra
  async getVisitasByObra(cod_obra: number): Promise<VisitaWithRelations[]> {
    return await this.visitaRepository.findByObra(cod_obra)
  }

  async finalizar(cod_visita: number, observaciones?: string): Promise<VisitaWithRelations> {
    const existingVisita = await this.visitaRepository.findById(cod_visita)
    if (!existingVisita) {
      throw new ValidationError('Visita no encontrada')
    }

    const updateData: Prisma.visitaUpdateInput = {
      estado: 'COMPLETADA',
      ...(observaciones && { observaciones })
    }

    return await this.visitaRepository.update(cod_visita, updateData)
  }

  async cancelar(cod_visita: number, motivo?: string): Promise<VisitaWithRelations> {
    const existingVisita = await this.visitaRepository.findById(cod_visita)
    if (!existingVisita) {
      throw new ValidationError('Visita no encontrada')
    }

    const updateData: Prisma.visitaUpdateInput = {
      estado: 'CANCELADA',
      fecha_cancelacion: new Date(),
      ...(motivo && { observaciones: `Visita cancelada: ${motivo}` })
    }

    return await this.visitaRepository.update(cod_visita, updateData)
  }
}

export const visitaService = new VisitaService()
