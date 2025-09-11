import { PrismaClient, vehiculo, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class VehiculoRepository {
  private prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  // Obtener todos los vehiculos
  async findAll(): Promise<vehiculo[]> {
    return await this.prisma.vehiculo.findMany({
      orderBy: { patente: 'asc' },
    })
  }

  // Obtener vehiculo por patente
  async findByPatente(patente: string): Promise<vehiculo | null> {
    return await this.prisma.vehiculo.findUnique({
      where: { patente },
    })
  }

  // Crear nuevo vehiculo
  async create(data: Prisma.vehiculoCreateInput): Promise<vehiculo> {
    return await this.prisma.vehiculo.create({
      data,
    })
  }

  // Actualizar vehiculo
  async update(
    patente: string,
    data: Prisma.vehiculoUpdateInput,
  ): Promise<vehiculo> {
    return await this.prisma.vehiculo.update({
      where: { patente },
      data,
    })
  }

  // Eliminar vehiculo
  async remove(patente: string): Promise<vehiculo> {
    return await this.prisma.vehiculo.delete({
      where: { patente },
    })
  }

  // Buscar por estado
  async findByEstado(estado: string): Promise<vehiculo[]> {
    return await this.prisma.vehiculo.findMany({
      where: { estado },
      orderBy: { patente: 'asc' },
    })
  }
}

export const vehiculoRepository = new VehiculoRepository()
