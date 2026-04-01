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
 * @method agregarOrdenesDeProduccion - Vincula OPs a una entrega existente.
 * @method quitarOrdenesDeProduccion - Desvincula OPs de una entrega.
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
    esFinal?: boolean
    empleados: { cuil: string; rol_entrega: 'ENCARGADO' | 'AYUDANTE' }[]
    maquinarias?: number[]
    vehiculos?: string[]
    cod_ops?: number[]
  }): Promise<entrega> {
    const {
      empleados,
      cod_obra,
      maquinarias,
      vehiculos,
      cod_ops,
      dias_viaticos,
      esFinal,
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
      esFinal: esFinal ?? false,
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
      // Vincular órdenes de producción al crear (N OPs por entrega)
      ...(cod_ops &&
        cod_ops.length > 0 && {
        ordenes_de_produccion: {
          connect: cod_ops.map(cod_op => ({ cod_op })),
        },
      }),
    }

    console.log(
      '--- Payload final enviado a Prisma ---',
      JSON.stringify(payload, null, 2),
    )

    if (esFinal) {
      return prisma.$transaction(async tx => {
        const nuevaEntrega = await tx.entrega.create({ data: payload })
        await tx.obra.update({
          where: { cod_obra },
          data: { estado: 'ENTREGADA' },
        })
        return nuevaEntrega
      })
    }

    return this.entregaRepository.create(payload)
  }

  async findAll(search?: string, estado?: string): Promise<entrega[]> {
    return this.entregaRepository.findAll(search, estado)
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
    cuilEmpleado: string,
    estado: string,
    search?: string,
    date?: string,
  ): Promise<entrega[]> {
    return this.entregaRepository.getByEmpleadoEstado(
      cuilEmpleado,
      estado,
      search,
      date,
    )
  }

  /**
   * Vincula una o varias órdenes de producción a una entrega existente.
   * @param cod_entrega - ID de la entrega destino
   * @param cod_ops - Array de IDs de órdenes de producción a vincular
   */
  async agregarOrdenesDeProduccion(
    cod_entrega: number,
    cod_ops: number[],
  ): Promise<entrega> {
    if (!cod_ops || cod_ops.length === 0) {
      throw new Error('Debe proporcionar al menos una orden de producción')
    }

    // Verificar que las OPs existen y no están ya asignadas a otra entrega
    const ops = await prisma.orden_de_produccion.findMany({
      where: { cod_op: { in: cod_ops } },
    })

    if (ops.length !== cod_ops.length) {
      const encontradas = ops.map(op => op.cod_op)
      const faltantes = cod_ops.filter(id => !encontradas.includes(id))
      throw new Error(
        `Órdenes de producción no encontradas: ${faltantes.join(', ')}`,
      )
    }

    const yaAsignadas = ops.filter(
      op => op.cod_entrega !== null && op.cod_entrega !== cod_entrega,
    )
    if (yaAsignadas.length > 0) {
      throw new Error(
        `Las siguientes OPs ya están asignadas a otra entrega: ${yaAsignadas.map(op => op.cod_op).join(', ')}`,
      )
    }

    return this.entregaRepository.update(cod_entrega, {
      ordenes_de_produccion: {
        connect: cod_ops.map(cod_op => ({ cod_op })),
      },
    })
  }

  /**
   * Desvincula una o varias órdenes de producción de una entrega.
   * @param cod_entrega - ID de la entrega
   * @param cod_ops - Array de IDs de órdenes de producción a desvincular
   */
  async quitarOrdenesDeProduccion(
    cod_entrega: number,
    cod_ops: number[],
  ): Promise<entrega> {
    if (!cod_ops || cod_ops.length === 0) {
      throw new Error('Debe proporcionar al menos una orden de producción')
    }

    return this.entregaRepository.update(cod_entrega, {
      ordenes_de_produccion: {
        disconnect: cod_ops.map(cod_op => ({ cod_op })),
      },
    })
  }

  async finalizar(
    cod_entrega: number,
    observaciones?: string,
  ): Promise<entrega> {
    const entregaActual = await prisma.entrega.findUnique({
      where: { cod_entrega },
      select: { esFinal: true, cod_obra: true },
    })

    if (!entregaActual) {
      throw new Error(`Entrega no encontrada (ID: ${cod_entrega})`)
    }

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

      // Si es la entrega final, cerrar la Obra automáticamente
      if (entregaActual.esFinal) {
        await tx.obra.update({
          where: { cod_obra: entregaActual.cod_obra },
          data: { estado: 'ENTREGADA' },
        })
      }

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
