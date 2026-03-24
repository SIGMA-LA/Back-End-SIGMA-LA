import { PrismaClient, entrega, Prisma } from '@prisma/client'

import { prisma } from '../../shared/db/prismaClient.js'

export class EntregaRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(data: Prisma.entregaCreateInput): Promise<entrega> {
    return this.prisma.entrega.create({ data })
  }

  async findAll(search?: string, estado?: string): Promise<entrega[]> {
    const whereClause: Prisma.entregaWhereInput = {}

    if (estado) {
      whereClause.estado = estado
    }

    if (search) {
      whereClause.OR = [
        { detalle: { contains: search, mode: 'insensitive' } },
        { observaciones: { contains: search, mode: 'insensitive' } },
        {
          obra: {
            OR: [
              { direccion: { contains: search, mode: 'insensitive' } },
              {
                cliente: {
                  OR: [
                    { nombre: { contains: search, mode: 'insensitive' } },
                    { apellido: { contains: search, mode: 'insensitive' } },
                    { razon_social: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          },
        },
      ]
    }

    return this.prisma.entrega.findMany({
      where: whereClause,
      orderBy: { fecha_hora_entrega: 'desc' },
      include: {
        obra: {
          include: {
            cliente: true,
            localidad: true,
          },
        },
        entrega_empleado: {
          include: {
            empleado: {
              select: {
                cuil: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        uso_maquinaria: {
          include: {
            maquinaria: {
              select: {
                descripcion: true,
              },
            },
          },
        },
        uso_vehiculo_entrega: {
          include: {
            vehiculo: {
              select: {
                patente: true,
                tipo_vehiculo: true,
              },
            },
          },
        },
        orden_de_produccion: true,
      },
    })
  }

  async getByEmpleadoEstado(
    cuil_empleado: string,
    estado: string,
    search?: string,
    date?: string,
  ): Promise<entrega[]> {
    const whereClause: Prisma.entregaWhereInput = {
      estado: estado,
      entrega_empleado: {
        some: {
          cuil: cuil_empleado,
        },
      },
    }

    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      whereClause.fecha_hora_entrega = {
        gte: startOfDay,
        lt: endOfDay,
      }
    }

    if (search) {
      whereClause.OR = [
        { detalle: { contains: search, mode: 'insensitive' } },
        { observaciones: { contains: search, mode: 'insensitive' } },
        {
          obra: {
            OR: [
              { direccion: { contains: search, mode: 'insensitive' } },
              {
                cliente: {
                  OR: [
                    { nombre: { contains: search, mode: 'insensitive' } },
                    { apellido: { contains: search, mode: 'insensitive' } },
                    { razon_social: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          },
        },
      ]
    }

    return this.prisma.entrega.findMany({
      where: whereClause,
      include: {
        entrega_empleado: {
          include: {
            empleado: {
              select: {
                cuil: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        obra: {
          select: {
            cod_obra: true,
            direccion: true,
            localidad: {
              select: { nombre_localidad: true },
            },
            cliente: {
              select: {
                razon_social: true,
                telefono: true,
                mail: true,
              },
            },
          },
        },
      },
      orderBy: { fecha_hora_entrega: 'desc' },
    })
  }

  async findById(cod_entrega: number): Promise<entrega | null> {
    return this.prisma.entrega.findUnique({
      where: { cod_entrega },
    })
  }

  async update(
    cod_entrega: number,
    data: Prisma.entregaUpdateInput,
  ): Promise<entrega> {
    return this.prisma.entrega.update({
      where: { cod_entrega },
      data,
    })
  }

  async delete(cod_entrega: number): Promise<entrega> {
    return this.prisma.entrega.delete({
      where: { cod_entrega },
    })
  }
}
