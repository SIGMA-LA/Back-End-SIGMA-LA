import { PrismaClient, entrega_empleado, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class EntregaEmpleadoRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(
    data: Prisma.entrega_empleadoCreateInput,
  ): Promise<entrega_empleado> {
    return await this.prisma.entrega_empleado.create({ data })
  }

  async findAll(): Promise<entrega_empleado[]> {
    return await this.prisma.entrega_empleado.findMany({
      include: {
        empleado: {
          select: {
            nombre: true,
            apellido: true,
            rol_actual: true,
          },
        },
        entrega: {
          select: {
            fecha_hora_entrega: true,
            estado: true,
            detalle: true,
          },
        },
        obra: {
          select: {
            direccion: true,
            cliente: {
              select: {
                razon_social: true,
              },
            },
          },
        },
      },
    })
  }

  async findById(
    cod_entrega: number,
    cuil: string,
  ): Promise<entrega_empleado | null> {
    return await this.prisma.entrega_empleado.findUnique({
      where: {
        cod_entrega_cuil: {
          cod_entrega: cod_entrega,
          cuil: cuil,
        },
      },
      include: {
        empleado: true,
        entrega: true,
        obra: true,
      },
    })
  }

  async update(
    cod_entrega: number,
    cuil: string,
    data: Prisma.entrega_empleadoUpdateInput,
  ): Promise<entrega_empleado> {
    return await this.prisma.entrega_empleado.update({
      where: {
        cod_entrega_cuil: {
          cod_entrega: cod_entrega,
          cuil: cuil,
        },
      },
      data,
    })
  }

  async delete(cod_entrega: number, cuil: string): Promise<entrega_empleado> {
    return await this.prisma.entrega_empleado.delete({
      where: {
        cod_entrega_cuil: {
          cod_entrega: cod_entrega,
          cuil: cuil,
        },
      },
    })
  }
}
