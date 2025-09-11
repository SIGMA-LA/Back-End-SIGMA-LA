import { PrismaClient, empleado, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class EmpleadoRepository {
  private prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  // Obtener todos los empleados
  async findAll(): Promise<empleado[]> {
    return await this.prisma.empleado.findMany({
      orderBy: { nombre: 'asc' },
    })
  }

  // Obtener empleado por CUIL
  async findByCuil(cuil: bigint): Promise<empleado | null> {
    return await this.prisma.empleado.findUnique({
      where: { cuil },
    })
  }

  // Crear nuevo empleado
  async create(data: Prisma.empleadoCreateInput): Promise<empleado> {
    return await this.prisma.empleado.create({
      data,
    })
  }

  // Actualizar empleado
  async update(
    cuil: bigint,
    data: Prisma.empleadoUpdateInput,
  ): Promise<empleado> {
    return await this.prisma.empleado.update({
      where: { cuil },
      data,
    })
  }

  // Eliminar empleado
  async delete(cuil: bigint): Promise<empleado> {
    return await this.prisma.empleado.delete({
      where: { cuil },
    })
  }

  // Buscar empleados por área de trabajo
  async findByArea(area_trabajo: string): Promise<empleado[]> {
    return await this.prisma.empleado.findMany({
      where: { area_trabajo },
      orderBy: { nombre: 'asc' },
    })
  }

  // Buscar empleados por rol
  async findByRol(rol_actual: string): Promise<empleado[]> {
    return await this.prisma.empleado.findMany({
      where: { rol_actual },
      orderBy: { nombre: 'asc' },
    })
  }

  // Buscar empleados por criterio
  async findByCriteria(
    criteria: Prisma.empleadoWhereInput,
  ): Promise<empleado[]> {
    return await this.prisma.empleado.findMany({
      where: criteria,
      orderBy: { nombre: 'asc' },
    })
  }

  // Verificar si existe empleado por CUIL
  async existsByCuil(cuil: bigint): Promise<boolean> {
    const empleado = await this.prisma.empleado.findUnique({
      where: { cuil },
      select: { cuil: true },
    })
    return !!empleado
  }

  // Contar total de empleados
  async count(): Promise<number> {
    return await this.prisma.empleado.count()
  }

  // Contar empleados por área
  async countByArea(area_trabajo: string): Promise<number> {
    return await this.prisma.empleado.count({
      where: { area_trabajo },
    })
  }

  // Contar empleados por rol
  async countByRol(rol_actual: string): Promise<number> {
    return await this.prisma.empleado.count({
      where: { rol_actual },
    })
  }
}
