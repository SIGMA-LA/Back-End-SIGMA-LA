import { EntregaRepository } from './entrega.repository.js'
import { entrega, Prisma } from '@prisma/client'
import { MaquinariaService } from '../Maquinaria/maquinaria.service.js'

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

  constructor() {
    this.entregaRepository = new EntregaRepository()
    this.maquinariaService = new MaquinariaService()
  }

  async create(data: {
    cod_obra: number
    fecha_hora_entrega: string
    detalle: string
    estado: 'PENDIENTE'
    observaciones?: string
    dias_viaticos?: number
    empleados: { cuil: string; rol_entrega: 'ENCARGADO' | 'AYUDANTE' }[]
    maquinarias?: number[]
    cod_op?: number
  }): Promise<entrega> {
    const { empleados, cod_obra, maquinarias, cod_op, dias_viaticos, ...entregaData } = data
    const fechaParaPrisma = new Date(data.fecha_hora_entrega)

    const diasDeUso = (dias_viaticos && dias_viaticos > 0) ? dias_viaticos : 1;
    const horasDeUsoEnMs = diasDeUso * 24 * 60 * 60 * 1000;
    const fechaFinEstimada = new Date(fechaParaPrisma.getTime() + horasDeUsoEnMs);

    if (maquinarias && maquinarias.length > 0) {
      await this.maquinariaService.verificarDisponibilidadMaquinarias(maquinarias, fechaParaPrisma, fechaFinEstimada);
    }

    const payload: Prisma.entregaCreateInput = {
      detalle: entregaData.detalle,
      estado: entregaData.estado,
      fecha_hora_entrega: fechaParaPrisma,
      ...(entregaData.observaciones && { observaciones: entregaData.observaciones }),
      ...(data.dias_viaticos !== undefined && { dias_viaticos: data.dias_viaticos }),
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
      ...(maquinarias && maquinarias.length > 0 && {
        uso_maquinaria: {
          create: maquinarias.map(cod_maquina => ({
            maquinaria: { connect: { cod_maquina: cod_maquina } },
            fecha_hora_ini_uso: fechaParaPrisma,
            fecha_hora_fin_est: fechaFinEstimada,
            estado: 'EN USO',
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

    console.log('--- Payload final enviado a Prisma ---', JSON.stringify(payload, null, 2));
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
  ): Promise<entrega[]> {
    return this.entregaRepository.getByEmpleadoEstado(cuil_empleado, estado)
  }
}
