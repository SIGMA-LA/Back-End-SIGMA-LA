import { orden_de_produccion, Prisma } from '@prisma/client'
import {
  OrdenProduccionFilters,
  OrdenProduccionRepository,
} from './ordenProduccion.repository.js'
import { prisma } from '../../shared/db/prismaClient.js'

export class OrdenProduccionService {
  private repository: OrdenProduccionRepository

  constructor() {
    this.repository = new OrdenProduccionRepository()
  }

  async create(data: {
    cod_obra: number
    url: string
    public_id: string
    fecha_validacion?: Date | null
  }): Promise<orden_de_produccion> {
    const prismaData: Prisma.orden_de_produccionCreateInput = {
      obra: {
        connect: { cod_obra: data.cod_obra },
      },
      fecha_confeccion: new Date(),
      fecha_validacion: data.fecha_validacion || null,
      url: data.url,
      public_id: data.public_id,
    }

    return await this.repository.create(prismaData)
  }

  async findAll(
    filters?: OrdenProduccionFilters,
  ): Promise<orden_de_produccion[]> {
    return this.repository.findAll(filters)
  }

  async findById(cod_op: number): Promise<orden_de_produccion | null> {
    return await this.repository.findById(cod_op)
  }

  async findValidadas(): Promise<orden_de_produccion[]> {
    return await this.repository.findValidadas()
  }

  async findEnProduccion(): Promise<orden_de_produccion[]> {
    return await this.repository.findEnProduccion()
  }

  async update(
    cod_op: number,
    data: Prisma.orden_de_produccionUpdateInput,
  ): Promise<orden_de_produccion> {
    return await this.repository.update(cod_op, data)
  }

  async remove(cod_op: number): Promise<orden_de_produccion> {
    const existingOrden = await this.repository.findById(cod_op)
    if (!existingOrden) {
      throw new Error(
        'No existe una orden de producción con el código proporcionado.',
      )
    }
    return await this.repository.delete(cod_op)
  }

  async findByObra(cod_obra: number): Promise<orden_de_produccion[]> {
    return await this.repository.findByObra(cod_obra)
  }

  async findByObraAndFinalizada(cod_obra: number): Promise<orden_de_produccion[]> {
    return await this.repository.findByObraAndFinalizada(cod_obra)
  }

  async finalizarProduccion(cod_op: number): Promise<orden_de_produccion> {
    const orden = await this.repository.findById(cod_op)
    if (!orden) {
      throw new Error('Orden de producción no encontrada.')
    }
    if (orden.estado !== 'EN PRODUCCION') {
      throw new Error(
        'Solo se pueden finalizar órdenes que están "En Producción".',
      )
    }
    const [ordenActualizada] = await prisma.$transaction([
      prisma.orden_de_produccion.update({
        where: { cod_op },
        data: { estado: 'FINALIZADA' },
      }),

    ])

    console.log(
      `[NOTIFICACIÓN] La producción de la Orden #${orden.cod_op} ha finalizado. Notificar a Coordinación.`,
    )

    return ordenActualizada
  }
}
