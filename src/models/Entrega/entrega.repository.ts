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
        }
      },
    })
  }

  async getByEmpleadoEstado(
    cuil_empleado: string,
    estado: string,
  ): Promise<entrega[]> {
    return this.prisma.entrega.findMany({
      where: {
        AND: [
          { estado: estado },
          {
            entrega_empleado: {
              some: {
                cuil: cuil_empleado,
              },
            },
          },
        ],
      },
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
              select: { cod_postal: true, nombre_localidad: true },
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
