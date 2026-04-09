import { EntregaRepository, type EntregaWithRelations } from './entrega.repository.js'
import { entrega, Prisma } from '@prisma/client'
import { MaquinariaService } from '../Maquinaria/maquinaria.service.js'
import { prisma } from '../../shared/db/prismaClient.js'
import { VehiculoService } from '../Vehiculo/vehiculo.service.js'
import { EmpleadoService } from '../Empleado/empleado.service.js'
import { ValidationError } from '../../shared/errors/validationError.js'
import { AppError } from '../../shared/errors/AppError.js'
import { eventBus } from '../../shared/events/eventBus.js'

/**
 * Servicio para manejar la lógica de negocio de entregas.
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
    empleados: { cuil: string; rol_entrega: 'ENCARGADO' | 'ACOMPANANTE' }[]
    maquinarias?: number[]
    vehiculos?: string[]
    cod_ops?: number[]
  }): Promise<EntregaWithRelations> {
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

    const obra = await prisma.obra.findUnique({ where: { cod_obra } })
    if (!obra) throw new AppError(`Obra no encontrada (ID: ${cod_obra})`, 404, 'OBRA_NOT_FOUND')

    const fechaParaPrisma = new Date(data.fecha_hora_entrega)
    const fechaSalidaPrisma = fecha_salida_estimada ? new Date(fecha_salida_estimada) : fechaParaPrisma
    const fechaFinEstimada = fecha_regreso_estimado ? new Date(fecha_regreso_estimado) : new Date(fechaParaPrisma.getTime() + 2 * 60 * 60 * 1000)

    if (!vehiculos || vehiculos.length === 0) {
      throw new ValidationError('Debe asignar obligatoriamente al menos un vehículo a la entrega', 'ERROR_VEHICULO')
    }

    const checks = []
    const cuilesEmpleados = empleados.map(emp => emp.cuil)

    if (cuilesEmpleados.length > 0) {
      checks.push(this.empleadoService.verificarDisponibilidadEmpleados(cuilesEmpleados, fechaSalidaPrisma, fechaFinEstimada).catch(err => err.message))
    }
    if (maquinarias && maquinarias.length > 0) {
      checks.push(this.maquinariaService.verificarDisponibilidadMaquinarias(maquinarias, fechaSalidaPrisma, fechaFinEstimada).catch(err => err.message))
    }
    if (vehiculos && vehiculos.length > 0) {
      checks.push(this.vehiculoService.verificarDisponibilidadVehiculos(vehiculos, fechaSalidaPrisma, fechaFinEstimada).catch(err => err.message))
    }

    const results = await Promise.all(checks)
    const errMessages = results.filter((msg): msg is string => typeof msg === 'string')
    if (errMessages.length > 0) throw new ValidationError(`Se detectaron sobreposiciones de agenda:\n${errMessages.join('\n')}`, 'CONFLICTO_AGENDA')

    const payload: Prisma.entregaCreateInput = {
      detalle: entregaData.detalle,
      estado: entregaData.estado,
      fecha_hora_entrega: fechaParaPrisma,
      esFinal: esFinal ?? false,
      ...(entregaData.observaciones && { observaciones: entregaData.observaciones }),
      ...(dias_viaticos !== undefined && { dias_viaticos }),
      obra: { connect: { cod_obra } },
      entrega_empleado: {
        create: empleados.map(emp => ({
          rol_entrega: emp.rol_entrega,
          empleado: { connect: { cuil: emp.cuil } },
          obra: { connect: { cod_obra } },
        })),
      },
      ...(maquinarias && maquinarias.length > 0 && {
        uso_maquinaria: {
          create: maquinarias.map(cod_maquina => ({
            maquinaria: { connect: { cod_maquina } },
            fecha_hora_ini_uso: fechaSalidaPrisma,
            fecha_hora_fin_est: fechaFinEstimada,
            obra: { connect: { cod_obra } },
          })),
        },
      }),
      ...(vehiculos && vehiculos.length > 0 && {
        uso_vehiculo_entrega: {
          create: vehiculos.map(patente => ({
            vehiculo: { connect: { patente } },
            fecha_hora_ini_uso: fechaSalidaPrisma,
            fecha_hora_ini_est: fechaFinEstimada,
            obra: { connect: { cod_obra } },
          })),
        },
      }),
      ...(cod_ops && cod_ops.length > 0 && {
        ordenes_de_produccion: { connect: cod_ops.map(cod_op => ({ cod_op })) },
      }),
    }

    const nuevaEntrega = esFinal
      ? await prisma.$transaction(async tx => {
        const result = await tx.entrega.create({ data: payload, include: {
          obra: { include: { cliente: true, localidad: true } },
          entrega_empleado: { include: { empleado: { select: { cuil: true, nombre: true, apellido: true } } } },
          uso_maquinaria: { include: { maquinaria: { select: { descripcion: true } } } },
          uso_vehiculo_entrega: { include: { vehiculo: { select: { patente: true, tipo_vehiculo: true } } } },
          ordenes_de_produccion: true,
        }}) as EntregaWithRelations
        await tx.obra.update({ where: { cod_obra }, data: { estado: 'ENTREGADA' } })
        return result
      })
      : await this.entregaRepository.create(payload)

    if (cuilesEmpleados.length > 0) {
      eventBus.emit('entrega.asignada', { entrega: nuevaEntrega, cuils: cuilesEmpleados })
    }

    return nuevaEntrega
  }

  async findAll(search?: string, estado?: string): Promise<EntregaWithRelations[]> {
    return this.entregaRepository.findAll(search, estado)
  }

  async findById(cod_entrega: number): Promise<EntregaWithRelations> {
    const entry = await this.entregaRepository.findById(cod_entrega)
    if (!entry) throw new AppError('Entrega no encontrada', 404, 'ENTREGA_NOT_FOUND')
    return entry
  }

  async update(cod_entrega: number, data: {
    fecha_hora_entrega?: string
    detalle?: string
    observaciones?: string
    dias_viaticos?: number
    estado?: string
    vehiculos?: string[]
    maquinarias?: number[]
    empleados?: { cuil: string; rol_entrega: 'ENCARGADO' | 'ACOMPANANTE' }[]
    fecha_salida_estimada?: string
    fecha_regreso_estimado?: string
    cod_ops?: number[]
  }): Promise<EntregaWithRelations> {
    const existingEntrega = await this.findById(cod_entrega) // Throws if not found

    const { fecha_hora_entrega, fecha_salida_estimada, fecha_regreso_estimado, vehiculos, maquinarias, empleados, cod_ops, ...simpleFields } = data

    // 1. Detección de cambios en fechas
    const newFechaEntrega = fecha_hora_entrega ? new Date(fecha_hora_entrega) : new Date(existingEntrega.fecha_hora_entrega)
    const vUsage = existingEntrega.uso_vehiculo_entrega?.[0]
    const curFechaSalida = vUsage ? new Date(vUsage.fecha_hora_ini_uso) : new Date(existingEntrega.fecha_hora_entrega)
    const curFechaRetorno = vUsage ? new Date(vUsage.fecha_hora_ini_est) : new Date(new Date(existingEntrega.fecha_hora_entrega).getTime() + 2 * 60 * 60 * 1000)

    const newFechaSalida = fecha_salida_estimada ? new Date(fecha_salida_estimada) : curFechaSalida
    const newFechaRetorno = fecha_regreso_estimado ? new Date(fecha_regreso_estimado) : curFechaRetorno

    const hasDatesChanged = 
      newFechaEntrega.getTime() !== new Date(existingEntrega.fecha_hora_entrega).getTime() ||
      newFechaSalida.getTime() !== curFechaSalida.getTime() ||
      newFechaRetorno.getTime() !== curFechaRetorno.getTime()

    // 2. Detección de cambios en asignaciones de recursos
    const hasVehiclesChanged = !!vehiculos && (
      vehiculos.length !== existingEntrega.uso_vehiculo_entrega.length ||
      vehiculos.some(v => !existingEntrega.uso_vehiculo_entrega.find(ev => ev.patente === v))
    )

    const hasMachineryChanged = !!maquinarias && (
      maquinarias.length !== existingEntrega.uso_maquinaria.length ||
      maquinarias.some(m => !existingEntrega.uso_maquinaria.find(em => em.cod_maquina === m))
    )

    const hasPersonnelChanged = !!empleados && (
      empleados.length !== existingEntrega.entrega_empleado.length ||
      empleados.some(e => !existingEntrega.entrega_empleado.find(ee => ee.cuil === e.cuil && ee.rol_entrega === e.rol_entrega))
    )

    // 3. Validaciones de disponibilidad condicionales
    if (hasDatesChanged || hasVehiclesChanged || hasMachineryChanged || hasPersonnelChanged) {
      const vehiculosToValidate = vehiculos || existingEntrega.uso_vehiculo_entrega.map(v => v.patente)
      const maquinariasToValidate = maquinarias || existingEntrega.uso_maquinaria.map(m => m.cod_maquina)
      const cuilesToValidate = empleados?.map(e => e.cuil) || existingEntrega.entrega_empleado.map(e => e.cuil)

      const checks = []
      if (cuilesToValidate.length > 0) {
        checks.push(this.empleadoService.verificarDisponibilidadEmpleados(cuilesToValidate, newFechaSalida, newFechaRetorno, undefined, cod_entrega).catch(err => err.message))
      }
      if (maquinariasToValidate.length > 0) {
        checks.push(this.maquinariaService.verificarDisponibilidadMaquinarias(maquinariasToValidate, newFechaSalida, newFechaRetorno, cod_entrega).catch(err => err.message))
      }
      if (vehiculosToValidate.length > 0) {
        checks.push(this.vehiculoService.verificarDisponibilidadVehiculos(vehiculosToValidate, newFechaSalida, newFechaRetorno, undefined, cod_entrega).catch(err => err.message))
      }

      const results = await Promise.all(checks)
      const errMessages = results.filter((msg): msg is string => typeof msg === 'string')
      if (errMessages.length > 0) throw new ValidationError(`Se detectaron sobreposiciones de agenda:\n${errMessages.join('\n')}`, 'CONFLICTO_AGENDA')
    }

    // 4. Preparación de actualización
    const updateData: Prisma.entregaUpdateInput = {
      ...simpleFields,
      ...(fecha_hora_entrega && { fecha_hora_entrega: newFechaEntrega }),
    }

    if (hasPersonnelChanged && empleados) {
      updateData.entrega_empleado = {
        deleteMany: {},
        create: empleados.map(emp => ({
          rol_entrega: emp.rol_entrega,
          empleado: { connect: { cuil: emp.cuil } },
          obra: { connect: { cod_obra: existingEntrega.cod_obra } },
        })),
      }
    }

    if (hasMachineryChanged && maquinarias) {
      updateData.uso_maquinaria = {
        deleteMany: {},
        create: maquinarias.map(cod_maquina => ({
          maquinaria: { connect: { cod_maquina } },
          fecha_hora_ini_uso: newFechaSalida,
          fecha_hora_fin_est: newFechaRetorno,
          obra: { connect: { cod_obra: existingEntrega.cod_obra } },
        })),
      }
    } else if (hasDatesChanged && !hasMachineryChanged) {
      updateData.uso_maquinaria = {
        updateMany: {
          where: { cod_entrega },
          data: { fecha_hora_ini_uso: newFechaSalida, fecha_hora_fin_est: newFechaRetorno }
        }
      }
    }

    if (hasVehiclesChanged && vehiculos) {
      updateData.uso_vehiculo_entrega = {
        deleteMany: {},
        create: vehiculos.map(patente => ({
          vehiculo: { connect: { patente } },
          fecha_hora_ini_uso: newFechaSalida,
          fecha_hora_ini_est: newFechaRetorno,
          obra: { connect: { cod_obra: existingEntrega.cod_obra } },
        })),
      }
    } else if (hasDatesChanged && !hasVehiclesChanged) {
      updateData.uso_vehiculo_entrega = {
        updateMany: {
          where: { cod_entrega },
          data: { fecha_hora_ini_uso: newFechaSalida, fecha_hora_ini_est: newFechaRetorno }
        }
      }
    }

    // 5. Sincronización de Ordenes de Producción
    if (cod_ops) {
      const currentOps = existingEntrega.ordenes_de_produccion.map(op => op.cod_op)
      const disconnectOps = currentOps.filter(id => !cod_ops.includes(id))
      const connectOps = cod_ops.filter(id => !currentOps.includes(id))

      if (disconnectOps.length > 0 || connectOps.length > 0) {
        updateData.ordenes_de_produccion = {
          disconnect: disconnectOps.map(cod_op => ({ cod_op })),
          connect: connectOps.map(cod_op => ({ cod_op }))
        }
      }
    }

    const updatedEntrega = await this.entregaRepository.update(cod_entrega, updateData)

    if (hasPersonnelChanged && empleados) {
      const newlyAssignedCuils = empleados.filter(e => !existingEntrega.entrega_empleado.find(ee => ee.cuil === e.cuil)).map(e => e.cuil)
      if (newlyAssignedCuils.length > 0) {
        eventBus.emit('entrega.asignada', { entrega: updatedEntrega, cuils: newlyAssignedCuils })
      }

      const removedCuils = existingEntrega.entrega_empleado.filter(ee => !empleados.find(e => e.cuil === ee.cuil)).map(ee => ee.cuil)
      if (removedCuils.length > 0) {
        eventBus.emit('entrega.actualizada', { entrega: updatedEntrega, cuils: removedCuils, tipo: 'DESASIGNADO' })
      }
    }

    if (hasDatesChanged) {
      const remainingCuils = updatedEntrega.entrega_empleado.map(ee => ee.cuil)
      if (remainingCuils.length > 0) {
        eventBus.emit('entrega.actualizada', { entrega: updatedEntrega, cuils: remainingCuils, tipo: 'HORARIO_MODIFICADO' })
      }
    }

    return updatedEntrega
  }

  async delete(cod_entrega: number): Promise<entrega> {
    await this.findById(cod_entrega) // Throws if not found
    return this.entregaRepository.delete(cod_entrega)
  }

  async getByEmpleadoEstado(cuilEmpleado: string, estado: string, search?: string, date?: string): Promise<entrega[]> {
    return this.entregaRepository.getByEmpleadoEstado(cuilEmpleado, estado, search, date)
  }

  async agregarOrdenesDeProduccion(cod_entrega: number, cod_ops: number[]): Promise<entrega> {
    if (!cod_ops || cod_ops.length === 0) throw new ValidationError('Debe proporcionar al menos una orden de producción', 'MISSING_PARAMS')
    const ops = await prisma.orden_de_produccion.findMany({ where: { cod_op: { in: cod_ops } } })
    if (ops.length !== cod_ops.length) throw new ValidationError('Una o más órdenes de producción no existen', 'ORDEN_NOT_FOUND')
    const yaAsignadas = ops.filter(op => op.cod_entrega !== null && op.cod_entrega !== cod_entrega)
    if (yaAsignadas.length > 0) throw new ValidationError(`Las siguientes OPs ya están asignadas a otra entrega: ${yaAsignadas.map(op => op.cod_op).join(', ')}`, 'CONFLICTO_OP')
    return this.entregaRepository.update(cod_entrega, { ordenes_de_produccion: { connect: cod_ops.map(cod_op => ({ cod_op })) } })
  }

  async quitarOrdenesDeProduccion(cod_entrega: number, cod_ops: number[]): Promise<entrega> {
    if (!cod_ops || cod_ops.length === 0) throw new ValidationError('Debe proporcionar al menos una orden de producción', 'MISSING_PARAMS')
    return this.entregaRepository.update(cod_entrega, { ordenes_de_produccion: { disconnect: cod_ops.map(cod_op => ({ cod_op })) } })
  }

  async finalizar(cod_entrega: number, observaciones?: string): Promise<entrega> {
    const entregaActual = await prisma.entrega.findUnique({ where: { cod_entrega }, select: { esFinal: true, cod_obra: true } })
    if (!entregaActual) throw new AppError(`Entrega no encontrada (ID: ${cod_entrega})`, 404, 'ENTREGA_NOT_FOUND')

    return (await prisma.$transaction(async tx => {
      const updated = await tx.entrega.update({
        where: { cod_entrega },
        data: { estado: 'ENTREGADO', observaciones: observaciones || 'Entrega completada exitosamente' }
      })
      await tx.uso_vehiculo_entrega.updateMany({ where: { cod_entrega }, data: { fecha_hora_fin_real: new Date() } })
      await tx.uso_maquinaria.updateMany({ where: { cod_entrega }, data: { fecha_hora_fin_real: new Date() } })
      if (entregaActual.esFinal) {
        await tx.obra.update({ where: { cod_obra: entregaActual.cod_obra }, data: { estado: 'ENTREGADA' } })
      }
      return updated
    }))
  }

  async cancelar(cod_entrega: number, motivo?: string): Promise<entrega> {
    await this.findById(cod_entrega) // Throws if not found
    const canceledEntrega = await prisma.$transaction(async tx => {
      const updated = await tx.entrega.update({
        where: { cod_entrega },
        data: {
          estado: 'CANCELADO',
          observaciones: motivo ? `Entrega cancelada: ${motivo}` : 'Entrega cancelada',
          fecha_cancelacion: new Date()
        },
        include: { entrega_empleado: true }
      }) as EntregaWithRelations
      await tx.uso_vehiculo_entrega.updateMany({ where: { cod_entrega }, data: { fecha_hora_fin_real: new Date() } })
      await tx.uso_maquinaria.updateMany({ where: { cod_entrega }, data: { fecha_hora_fin_real: new Date() } })
      return updated
    })

    const assignedCuils = canceledEntrega.entrega_empleado?.map(ee => ee.cuil) || []
    if (assignedCuils.length > 0) {
      eventBus.emit('entrega.actualizada', { entrega: canceledEntrega, cuils: assignedCuils, tipo: 'CANCELADA' })
    }

    return canceledEntrega
  }
}

