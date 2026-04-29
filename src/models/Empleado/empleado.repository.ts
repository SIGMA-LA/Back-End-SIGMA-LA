import { PrismaClient, empleado, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'
import { EmpleadoPayload } from './empleado.service.js'

export class EmpleadoRepository {
  private prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  // Obtener todos los empleados activos (solo datos públicos)
  async findAllPublic(): Promise<EmpleadoPayload[]> {
    return await this.prisma.empleado.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: {
        cuil: true,
        nombre: true,
        apellido: true,
        rol_actual: true,
        area_trabajo: true,
        activo: true,
      },
    })
  }

  // Buscar usos en un rango de tiempo
  async findUsagesInRange(cuiles: string[], timeWindowStart: Date) {
    return await this.prisma.empleado.findMany({
      where: { cuil: { in: cuiles } },
      include: {
        entrega_empleado: {
          include: {
            entrega: {
              include: {
                uso_vehiculo_entrega: true,
              },
            },
          },
          where: {
            entrega: {
              fecha_hora_entrega: { gt: timeWindowStart },
              estado: { in: ['PENDIENTE', 'EN CURSO'] },
            },
          },
        },
        empleado_visita: {
          include: {
            visita: {
              include: {
                uso_vehiculo_visita: true,
              },
            },
          },
          where: {
            visita: {
              fecha_hora_visita: { gt: timeWindowStart },
              estado: { in: ['PROGRAMADA', 'EN CURSO', 'REPROGRAMADA'] },
            },
          },
        },
      },
    })
  }

  // Helper para generar variaciones del CUIL
  private getCuilVariations(cuil: string): string[] {
    const cuilNormalized = cuil.split('-').join('')
    let cuilConGuiones = cuil
    if (cuilNormalized.length === 11) {
      cuilConGuiones = `${cuilNormalized.slice(0, 2)}-${cuilNormalized.slice(2, 10)}-${cuilNormalized.slice(10)}`
    }
    return [cuilNormalized, cuilConGuiones, cuil]
  }

  // Obtener empleado por CUIL (solo datos públicos)
  async findByCuilPublic(cuil: string): Promise<EmpleadoPayload | null> {
    return await this.prisma.empleado.findFirst({
      where: { cuil: { in: this.getCuilVariations(cuil) } },
      select: {
        cuil: true,
        nombre: true,
        apellido: true,
        rol_actual: true,
        area_trabajo: true,
        activo: true,
      },
    })
  }
  // Obtener empleado por CUIL
  async findByCuil(cuil: string): Promise<empleado | null> {
    return await this.prisma.empleado.findFirst({
      where: { cuil: { in: this.getCuilVariations(cuil) } },
    })
  }

  async findPerfil(cuil: string): Promise<EmpleadoPayload | null> {
    return await this.prisma.empleado.findFirst({
      where: { cuil: { in: this.getCuilVariations(cuil) } },
      select: {
        cuil: true,
        nombre: true,
        apellido: true,
        rol_actual: true,
        area_trabajo: true,
        activo: true,
        mail: true,
        notificacion_email: true,
        notificacion_whatsapp: true,
        config_coordinacion: {
          select: {
            visita_completada: true,
            nueva_orden_produccion: true,
            cambio_estado: true,
            pago_completo_obra: true,
          },
        },
        config_produccion: {
          select: {
            orden_aprobada: true,
          },
        },
        config_visitador: {
          select: {
            asignacion_visita: true,
            actualizacion_visita: true,
          },
        },
        config_planta: {
          select: {
            asignacion_visita: true,
            asignacion_entrega: true,
            actualizacion_visita: true,
          },
        },
        config_ventas: {
          select: {
            obra_produccion: true,
            obra_pedido_stock: true,
            obra_produccion_final: true,
            obra_entregada: true,
          },
        },
      },
    }) as unknown as EmpleadoPayload | null
  }

  // Crear nuevo empleado
  async create(data: Prisma.empleadoCreateInput): Promise<empleado> {
    return await this.prisma.empleado.create({
      data,
    })
  }

  // Actualizar empleado
  async update(
    cuil: string,
    data: Prisma.empleadoUpdateInput,
  ): Promise<empleado> {
    return await this.prisma.empleado.update({
      where: { cuil: cuil },
      data,
      include: {
        config_coordinacion: true,
      },
    })
  }

  // Eliminar empleado
  async delete(cuil: string): Promise<empleado> {
    return await this.prisma.empleado.delete({
      where: { cuil: cuil },
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
  async findByCriteriaPublic(
    criteria: Prisma.empleadoWhereInput,
  ): Promise<EmpleadoPayload[]> {
    return await this.prisma.empleado.findMany({
      where: criteria,
      orderBy: { nombre: 'asc' },
      select: {
        cuil: true,
        nombre: true,
        apellido: true,
        rol_actual: true,
        area_trabajo: true,
        activo: true,
      },
    })
  }

  // Verificar si existe empleado por CUIL
  async existsByCuil(cuil: string): Promise<boolean> {
    const empleado = await this.prisma.empleado.findFirst({
      where: { cuil: { in: this.getCuilVariations(cuil) } },
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

  async updateRefreshTokenHash(
    cuil: string,
    hash: string | null,
  ): Promise<void> {
    await this.prisma.empleado.update({
      where: { cuil },
      data: { refreshTokenHash: hash },
    })
  }
}
