import { VisitaRepository } from './visita.repository.js'
import { visita, Prisma } from '@prisma/client'
import { EmpleadoService } from '../Empleado/empleado.service.js'
import { VehiculoService } from '../Vehiculo/vehiculo.service.js'

/**
 * Servicio para manejar la lógica de negocio de visitas.
 * @class VisitaService
 * @method create - Crea una nueva visita con soporte para campos opcionales.
 * @method findAll - Obtiene todas las visitas.
 * @method findById - Obtiene una visita por su cod_visita.
 * @method update - Actualiza una visita existente verificando que existe.
 * @method remove - Elimina una visita por su cod_visita verificando que existe.
 * @method getVisitasByEmpleadoAndEstado - Obtiene visitas de un empleado por estado específico.
 * @method getVisitasByEmpleado - Obtiene todas las visitas de un empleado.
 * @method getVisitasByObra - Obtiene visitas asociadas a una obra.
 * @returns {Promise<visita | visita[] | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
interface CreateVisitaData {
  empleados_visita: string[]
  fecha_hora_visita: string
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
  async create(data: CreateVisitaData) {
    const empleadosParaCrear = data.empleados_visita.map(
      (cuilEmpleado: string) => ({
        cuil: cuilEmpleado,
      }),
    )

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

    const checks = []

    if (data.empleados_visita && data.empleados_visita.length > 0) {
      checks.push(
        this.empleadoService
          .verificarDisponibilidadEmpleados(
            data.empleados_visita,
            fechaParaPrisma,
            fechaFinEstimada,
          )
          .catch(err => err.message),
      )
    }

    if (data.vehiculo) {
      checks.push(
        this.vehiculoService
          .verificarDisponibilidadVehiculos(
            [data.vehiculo],
            fechaParaPrisma,
            fechaFinEstimada,
          )
          .catch(err => err.message),
      )
    }

    const results = await Promise.all(checks)
    const errMessages = results.filter(Boolean) as string[]
    if (errMessages.length > 0) {
      throw new Error(
        `Se detectaron sobreposiciones de agenda:\n${errMessages.join('\n')}`,
      )
    }

    const createData = {
      fecha_hora_visita: new Date(data.fecha_hora_visita),
      motivo_visita: data.motivo_visita,
      estado: 'PROGRAMADA',
      observaciones: data.observaciones,
      direccion_visita: data.direccion_visita,
      dias_viatico: data.dias_viatico,
      nombre_cliente: data.nombre_cliente,
      apellido_cliente: data.apellido_cliente,
      telefono_cliente: data.telefono_cliente,

      ...(data.cod_obra && { obra: { connect: { cod_obra: data.cod_obra } } }),
      ...(data.cod_localidad && {
        localidad: { connect: { cod_localidad: data.cod_localidad } },
      }),

      empleado_visita: {
        createMany: {
          data: empleadosParaCrear,
          skipDuplicates: true,
        },
      },
      uso_vehiculo_visita: {
        create: {
          vehiculo: {
            connect: {
              patente: data.vehiculo,
            },
          },
          fecha_hora_ini_uso: new Date(data.fecha_hora_visita),
          fecha_hora_fin_est: new Date(
            data.fechaHasta || data.fecha_hora_visita,
          ),
        },
      },
    }

    return await this.visitaRepository.create(createData)
  }

  // Obtener todas las visitas
  async findAll(): Promise<visita[]> {
    return await this.visitaRepository.findAll()
  }

  // Obtener visita por cod_visita
  async findById(cod_visita: number): Promise<visita | null> {
    return await this.visitaRepository.findById(cod_visita)
  }

  async buscar(q: string, page = 1, pageSize = 25): Promise<visita[]> {
    const limit = Math.max(1, Math.min(100, pageSize))
    const offset = (Math.max(1, page) - 1) * limit
    return await this.visitaRepository.buscar(q, limit, offset)
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
    },
  ): Promise<visita> {
    const existingVisita = (await this.visitaRepository.findById(
      cod_visita,
    )) as visita & {
      empleado_visita: { cuil: string }[]
      uso_vehiculo_visita: { patente: string }[]
    }
    if (!existingVisita) {
      throw new Error('Visita no encontrada')
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
      ...simpleFields
    } = data

    const finalFechaInicio = fecha_hora_visita
      ? new Date(fecha_hora_visita)
      : new Date(existingVisita.fecha_hora_visita)

    let finalFechaFin: Date
    if (fechaHasta) {
      finalFechaFin = new Date(fechaHasta)
    } else {
      const dias =
        dias_viatico !== undefined
          ? dias_viatico
          : existingVisita.dias_viatico || 1
      finalFechaFin = new Date(
        finalFechaInicio.getTime() +
          (dias > 0 ? dias : 1) * 24 * 60 * 60 * 1000,
      )
    }

    const cuilesToValidate =
      empleados_visita || existingVisita.empleado_visita.map(ev => ev.cuil)
    const vehiculoToValidate =
      vehiculo || existingVisita.uso_vehiculo_visita?.[0]?.patente

    const checks = []

    if (cuilesToValidate && cuilesToValidate.length > 0) {
      checks.push(
        this.empleadoService
          .verificarDisponibilidadEmpleados(
            cuilesToValidate,
            finalFechaInicio,
            finalFechaFin,
            cod_visita,
          )
          .catch((err: Error) => err.message),
      )
    }

    if (vehiculoToValidate) {
      checks.push(
        this.vehiculoService
          .verificarDisponibilidadVehiculos(
            [vehiculoToValidate],
            finalFechaInicio,
            finalFechaFin,
            cod_visita,
          )
          .catch((err: Error) => err.message),
      )
    }

    const results = await Promise.all(checks)
    const errMessages = results.filter(Boolean) as string[]
    if (errMessages.length > 0) {
      throw new Error(
        `Se detectaron sobreposiciones de agenda:\n${errMessages.join('\n')}`,
      )
    }

    const updateData: Prisma.visitaUpdateInput = {
      ...simpleFields,
      ...(fecha_hora_visita && {
        fecha_hora_visita: new Date(fecha_hora_visita),
      }),
      ...(fecha_cancelacion && {
        fecha_cancelacion: new Date(fecha_cancelacion),
      }),
      ...(dias_viatico !== undefined && {
        dias_viatico,
      }),
    }

    // Update employees if provided
    if (empleados_visita) {
      updateData.empleado_visita = {
        deleteMany: {},
        create: empleados_visita.map(cuil => ({ cuil })),
      }
    }

    // Update vehicle or its times if vehicle or time changed
    if (
      vehiculo ||
      fecha_hora_visita ||
      fechaHasta ||
      dias_viatico !== undefined
    ) {
      updateData.uso_vehiculo_visita = {
        deleteMany: {},
        create: {
          vehiculo: { connect: { patente: vehiculoToValidate! } },
          fecha_hora_ini_uso: finalFechaInicio,
          fecha_hora_fin_est: finalFechaFin,
        },
      }
    }

    // Conectar obra si se proporciona
    if (cod_obra !== undefined) {
      if (cod_obra === null) {
        updateData.obra = { disconnect: true }
      } else {
        updateData.obra = { connect: { cod_obra } }
      }
    }

    // Conectar localidad si se proporciona
    if (cod_localidad !== undefined) {
      if (cod_localidad === null) {
        updateData.localidad = { disconnect: true }
      } else {
        updateData.localidad = { connect: { cod_localidad } }
      }
    }

    return await this.visitaRepository.update(cod_visita, updateData)
  }

  // Eliminar visita
  async remove(cod_visita: number): Promise<visita> {
    const existingVisita = await this.visitaRepository.findById(cod_visita)
    if (!existingVisita) {
      throw new Error('Visita no encontrada')
    }

    return await this.visitaRepository.remove(cod_visita)
  }

  // Obtener visitas por estado
  async findByEstado(estado: string): Promise<visita[]> {
    return await this.visitaRepository.findByEstado(estado)
  }

  // Obtener visitas por obra
  async findByObra(cod_obra: number): Promise<visita[]> {
    return await this.visitaRepository.findByObra(cod_obra)
  }
  async getVisitasByEmpleadoAndEstado(
    cuil: string,
    estado: string[] | string,
    search?: string,
    date?: string,
  ): Promise<visita[]> {
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
  ): Promise<visita[]> {
    return await this.visitaRepository.findByEmpleado(
      cuil,
      estados,
      search,
      date,
    )
  }

  // Obtener visitas asociadas a una obra (usando el método existente con nombre más específico)
  async getVisitasByObra(cod_obra: number): Promise<visita[]> {
    return await this.visitaRepository.findByObra(cod_obra)
  }

  /**
   * Finaliza una visita, cambiando su estado a 'COMPLETADA'.
   * Opcionalmente, actualiza las observaciones (para registrar medidas).
   * @param {number} cod_visita - El código de la visita a finalizar.
   * @param {string} [observaciones] - Las observaciones o medidas registradas.
   * @returns {Promise<visita>} - La visita actualizada.
   */
  async finalizar(cod_visita: number, observaciones?: string): Promise<visita> {
    const existingVisita = await this.visitaRepository.findById(cod_visita)
    if (!existingVisita) {
      throw new Error('Visita no encontrada')
    }

    const updateData: Prisma.visitaUpdateInput = {
      estado: 'COMPLETADA',
    }

    if (observaciones) {
      updateData.observaciones = observaciones
    }

    return await this.visitaRepository.update(cod_visita, updateData)
  }

  /**
   * Cancela una visita, cambiando su estado a 'CANCELADA'.
   * Registra la fecha de cancelación y actualiza las observaciones con el motivo.
   * @param {number} cod_visita - El código de la visita a cancelar.
   * @param {string} [motivo] - El motivo de la cancelación.
   * @returns {Promise<visita>} - La visita actualizada.
   */
  async cancelar(cod_visita: number, motivo?: string): Promise<visita> {
    const existingVisita = await this.visitaRepository.findById(cod_visita)
    if (!existingVisita) {
      throw new Error('Visita no encontrada')
    }

    const updateData: Prisma.visitaUpdateInput = {
      estado: 'CANCELADA',
      fecha_cancelacion: new Date(),
    }

    if (motivo) {
      updateData.observaciones = `Visita cancelada: ${motivo}`
    }

    return await this.visitaRepository.update(cod_visita, updateData)
  }
}

export const visitaService = new VisitaService()
