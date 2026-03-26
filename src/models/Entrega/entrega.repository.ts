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

  async findAll(): Promise<entrega[]> {
    return this.prisma.entrega.findMany({
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
                descripcion: true
              }
            }
          }
        },
        uso_vehiculo_entrega: {
          include: {
            vehiculo: {
              select: {
                patente: true,
                tipo_vehiculo: true
              }
            }
          }
        },
        orden_de_produccion: true,
      },
    })
  }

  async getByEmpleadoEstado(
    cuil_empleado: string,
    estado: string,
    search?: string,
    date?: string
  ): Promise<entrega[]> {
    const filters: Prisma.entregaWhereInput[] = [
      { estado: estado },
      {
        entrega_empleado: {
          some: {
            cuil: cuil_empleado,
          },
        },
      },
    ]

    if (search) {
      filters.push({
        obra: {
          OR: [
            { direccion: { contains: search } },
            { 
              localidad: {
                nombre_localidad: { contains: search }
              }
            }
          ]
        }
      })
    }

    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`)
      const endDate = new Date(`${date}T23:59:59.999Z`)
      filters.push({
        fecha_hora_entrega: {
          gte: startDate,
          lte: endDate,
        }
      })
    }

    return this.prisma.entrega.findMany({
      where: { AND: filters },
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
