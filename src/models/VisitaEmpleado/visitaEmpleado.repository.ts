import { PrismaClient, empleado_visita, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class VisitaEmpleadoRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(
    data: Prisma.empleado_visitaCreateInput,
  ): Promise<empleado_visita> {
    return await this.prisma.empleado_visita.create({ data })
  }

  async findAll(): Promise<empleado_visita[]> {
    return await this.prisma.empleado_visita.findMany({
      include: {
        empleado: {
          select: {
            nombre: true,
            apellido: true,
            rol_actual: true,
          },
        },
        visita: {
          select: {
            fecha_hora_visita: true,
            estado: true,
            motivo_visita: true,
            direccion_visita: true,
          },
        },
      },
    })
  }

  async findById(
    cuil: string,
    cod_visita: number,
  ): Promise<empleado_visita | null> {
    return await this.prisma.empleado_visita.findUnique({
      where: {
        cuil_cod_visita: {
          cuil: cuil,
          cod_visita: cod_visita,
        },
      },
      include: {
        empleado: true,
        visita: true,
      },
    })
  }

  async update(
    cuil: string,
    cod_visita: number,
    data: Prisma.empleado_visitaUpdateInput,
  ): Promise<empleado_visita> {
    return await this.prisma.empleado_visita.update({
      where: {
        cuil_cod_visita: {
          cuil: cuil,
          cod_visita: cod_visita,
        },
      },
      data,
    })
  }

  async delete(cuil: string, cod_visita: number): Promise<empleado_visita> {
    return await this.prisma.empleado_visita.delete({
      where: {
        cuil_cod_visita: {
          cuil: cuil,
          cod_visita: cod_visita,
        },
      },
    })
  }
}
