import { EntregaRepository } from './entrega.repository.js'
import { entrega, Prisma } from '@prisma/client'
import { MaquinariaService } from '../Maquinaria/maquinaria.service.js'
import { prisma } from '../../shared/db/prismaClient.js'
import { VehiculoService } from '../Vehiculo/vehiculo.service.js'
import { EmpleadoService } from '../Empleado/empleado.service.js'

/**
 * Servicio para manejar la lógica de negocio de entregas.
 * @class EntregaService
 * @method create - Crea una nueva entrega.
 * @method findAll - Obtiene todas las entregas.
 * @method findById - Obtiene una entrega por cod_entrega.
 * @method update - Actualiza una entrega existente.
 * @method delete - Elimina una entrega por su cod_entrega.
 * @returns {Promise<entrega | entrega[] | number | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */

export class EntregaService {
  private entregaRepository: EntregaRepository
  private maquinariaService: MaquinariaService
  private vehiculoService: VehiculoService
  private empleadoService: EmpleadoService

  constructor() {
    this.entregaRepository = new EntregaRepository()
    this.maquinariaService = new MaquinariaService()
    this.vehiculoService = new VehiculoService()
    this.empleadoService = new EmpleadoService()
  }

  async create(data: {
    cod_obra: number
    fecha_hora_entrega: string
    detalle: string
    estado: 'PENDIENTE'
    observaciones?: string
    dias_viaticos?: number
    fecha_salida_estimada?: string
    fecha_regreso_estimado?: string
    empleados: { cuil: string; rol_entrega: 'ENCARGADO' | 'AYUDANTE' }[]
    maquinarias?: number[]
    vehiculos?: string[]
    cod_op?: number
  }): Promise<entrega> {
    const {
      empleados,
      cod_obra,
      maquinarias,
      vehiculos,
      cod_op,
      dias_viaticos,
      fecha_salida_estimada,
      fecha_regreso_estimado,
      ...entregaData
    } = data

    // Validate Obra status
    const obra = await prisma.obra.findUnique({
      where: { cod_obra },
    })

    if (!obra) {
      throw new Error(`Obra no encontrada (ID: ${cod_obra})`)
    }

    const fechaParaPrisma = new Date(data.fecha_hora_entrega)

    const fechaSalidaPrisma = fecha_salida_estimada
      ? new Date(fecha_salida_estimada)
      : fechaParaPrisma

    const fechaFinEstimada = fecha_regreso_estimado
      ? new Date(fecha_regreso_estimado)
      : new Date(fechaParaPrisma.getTime() + 2 * 60 * 60 * 1000)

    if (!vehiculos || vehiculos.length === 0) {
      throw new Error(
        'Error de validación: Debe asignar obligatoriamente al menos un vehículo a la entrega',
      )
    }

    const checks = []
    const cuilesEmpleados = empleados.map(emp => emp.cuil)

    if (cuilesEmpleados.length > 0) {
      checks.push(
        this.empleadoService
          .verificarDisponibilidadEmpleados(
            cuilesEmpleados,
            fechaSalidaPrisma,
            fechaFinEstimada,
          )
          .catch(err => err.message),
      )
    }

    if (maquinarias && maquinarias.length > 0) {
      checks.push(
        this.maquinariaService
          .verificarDisponibilidadMaquinarias(
            maquinarias,
            fechaSalidaPrisma,
            fechaFinEstimada,
          )
          .catch(err => err.message),
      )
    }

    if (vehiculos && vehiculos.length > 0) {
      checks.push(
        this.vehiculoService
          .verificarDisponibilidadVehiculos(
            vehiculos,
            fechaSalidaPrisma,
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

    const payload: Prisma.entregaCreateInput = {
      detalle: entregaData.detalle,
      estado: entregaData.estado,
      fecha_hora_entrega: fechaParaPrisma,
      ...(entregaData.observaciones && {
        observaciones: entregaData.observaciones,
      }),
      ...(dias_viaticos !== undefined && {
        dias_viaticos: dias_viaticos,
      }),
      obra: {
        connect: { cod_obra: cod_obra },
      },
      entrega_empleado: {
        create: empleados.map(emp => ({
          rol_entrega: emp.rol_entrega,
          empleado: { connect: { cuil: emp.cuil } },
          obra: { connect: { cod_obra: cod_obra } },
        })),
      },
      ...(maquinarias &&
        maquinarias.length > 0 && {
          uso_maquinaria: {
            create: maquinarias.map(cod_maquina => ({
              maquinaria: { connect: { cod_maquina: cod_maquina } },
              fecha_hora_ini_uso: fechaSalidaPrisma,
              fecha_hora_fin_est: fechaFinEstimada,
              obra: { connect: { cod_obra: cod_obra } },
            })),
          },
        }),
      ...(vehiculos &&
        vehiculos.length > 0 && {
          uso_vehiculo_entrega: {
            create: vehiculos.map(patente => ({
              vehiculo: { connect: { patente: patente } },
              fecha_hora_ini_uso: fechaSalidaPrisma,
              fecha_hora_ini_est: fechaFinEstimada,
              obra: { connect: { cod_obra: cod_obra } },
            })),
          },
        }),
      ...(cod_op && {
        orden_de_produccion: {
          connect: { cod_op: cod_op },
        },
      }),
    }

    console.log(
      '--- Payload final enviado a Prisma ---',
      JSON.stringify(payload, null, 2),
    )
    return this.entregaRepository.create(payload)
  }

  async findAll(): Promise<entrega[]> {
    return this.entregaRepository.findAll()
  }

  async findById(cod_entrega: number): Promise<entrega | null> {
    return this.entregaRepository.findById(cod_entrega)
  }

  async update(
    cod_entrega: number,
    data: Prisma.entregaUpdateInput,
  ): Promise<entrega> {
    if (data.fecha_hora_entrega) {
      const fechaISO = new Date(data.fecha_hora_entrega as string).toISOString()
      data.fecha_hora_entrega = fechaISO
    }
    return this.entregaRepository.update(cod_entrega, data)
  }

  async delete(cod_entrega: number): Promise<entrega> {
    return this.entregaRepository.delete(cod_entrega)
  }

  async getByEmpleadoEstado(
    cuil_empleado: string,
    estado: string,
    search?: string,
    date?: string
  ): Promise<entrega[]> {
    return this.entregaRepository.getByEmpleadoEstado(cuil_empleado, estado, search, date)
  }

  async finalizar(
    cod_entrega: number,
    observaciones?: string,
  ): Promise<entrega> {
    // Solo actualizamos la entrega y liberamos sus recursos.
    // Hotfix temporal: Ya NO cerramos la Obra automáticamente aquí, para soportar Entregas Parciales
    // sin necesidad de alterar el Schema de Prisma actual.
    const [entregaActualizada] = await prisma.$transaction(async tx => {
      const entrega = await tx.entrega.update({
        where: { cod_entrega },
        data: {
          estado: 'ENTREGADO',
          observaciones: observaciones || 'Entrega completada exitosamente',
        },
      })

      await tx.uso_vehiculo_entrega.updateMany({
        where: { cod_entrega: cod_entrega },
        data: { fecha_hora_fin_real: new Date() },
      })

      await tx.uso_maquinaria.updateMany({
        where: { cod_entrega: cod_entrega },
        data: { fecha_hora_fin_real: new Date() },
      })

      // Se elimina el conteo y la actualización del estado de la Obra.
      // Así evitamos cerrar la Obra permanentemente en entregas parciales
      // sin requerir migraciones de base de datos de momento.

      return [entrega]
    })

    return entregaActualizada
  }

  async cancelar(cod_entrega: number, motivo?: string): Promise<entrega> {
    const [entregaCancelada] = await prisma.$transaction(async tx => {
      const entrega = await tx.entrega.update({
        where: { cod_entrega: cod_entrega },
        data: {
          estado: 'CANCELADO',
          observaciones: motivo
            ? `Entrega cancelada: ${motivo}`
            : 'Entrega cancelada',
          fecha_cancelacion: new Date(),
        },
      })

      await tx.uso_vehiculo_entrega.updateMany({
        where: { cod_entrega: cod_entrega },
        data: { fecha_hora_fin_real: new Date() },
      })

      await tx.uso_maquinaria.updateMany({
        where: { cod_entrega: cod_entrega },
        data: { fecha_hora_fin_real: new Date() },
      })

      return [entrega]
    })

    return entregaCancelada
  }
}
