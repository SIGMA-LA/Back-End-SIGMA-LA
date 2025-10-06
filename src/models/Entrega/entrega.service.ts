import { EntregaRepository } from './entrega.repository.js'
import { entrega, Prisma } from '@prisma/client'

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

  constructor() {
    this.entregaRepository = new EntregaRepository()
  }

  async create(data: {
    cod_obra: number
    fecha_hora_entrega: string
    detalle: string
    estado: 'PENDIENTE'
    observaciones?: string
    dias_viaticos?: number
    empleados: { cuil: string; rol_entrega: 'ENCARGADO' | 'AYUDANTE' }[]
  }): Promise<entrega> {
    const { empleados, cod_obra, ...entregaData } = data
    const fechaParaPrisma = new Date(data.fecha_hora_entrega)

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
