import { PrismaClient, obra, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export class ObraRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  async create(data: Prisma.obraCreateInput): Promise<obra> {
    return await this.prisma.obra.create({
      data,
    })
  }

  async findAll() {
    return await this.prisma.obra.findMany({
      orderBy: { cod_obra: 'desc' },
      include: {
        cliente: true,
        localidad: {
          include: {
            provincia: true,
          },
        },
        presupuesto: true,
        pago: true,
      },
    })
  }
  async filtrar({
    estado,
    cod_localidad,
  }: {
    estado?: string
    cod_localidad?: number
  }) {
    return this.prisma.obra.findMany({
      where: {
        ...(estado && { estado }),
        ...(cod_localidad && { cod_localidad }),
      },
      include: {
        cliente: true,
        localidad: {
          include: {
            provincia: true,
          },
        },
        presupuesto: true,
        pago: true,
      },
      orderBy: { cod_obra: 'desc' },
    })
  }

  async findById(id: number): Promise<obra | null> {
    return await this.prisma.obra.findUnique({
      where: { cod_obra: id },
      include: {
        cliente: true,
        localidad: true,
        presupuesto: true,
      },
    })
  }
  async subirNotaFabrica(
    id: number,
    path: string,
    filename: string,
  ): Promise<void> {
    await this.prisma.obra.update({
      where: { cod_obra: id },
      data: {
        nota_fabrica: path,
        nota_fabrica_pid: filename,
      },
    })
  }

  async update(id: number, data: Prisma.obraUpdateInput): Promise<obra> {
    return await this.prisma.obra.update({
      where: { cod_obra: id },
      data,
    })
  }

  async delete(id: number): Promise<obra> {
    return await this.prisma.obra.delete({
      where: { cod_obra: id },
    })
  }

  async findNotasSinOrdenAprobada(): Promise<obra[]> {
    return await this.prisma.obra.findMany({
      where: {
        nota_fabrica: {
          not: null,
        },
        estado: {
          in: ['ACTIVA', 'EN PRODUCCION'],
        },
        orden_de_produccion: {
          none: {
            estado: {
              in: ['APROBADA', 'EN PRODUCCION'],
            },
          },
        },
      },
      orderBy: { fecha_ini: 'desc' },
      include: {
        cliente: true,
        localidad: true,
      },
    })
  }
  async buscar(q: string) {
    return this.prisma.obra.findMany({
      where: {
        OR: [
          { direccion: { contains: q, mode: 'insensitive' } },
          { cliente: { razon_social: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: {
        cliente: true,
      },
      orderBy: { cod_obra: 'desc' },
      take: 10,
    })
  }

  async findNotasConOrdenEnProceso(): Promise<obra[]> {
    return await this.prisma.obra.findMany({
      where: {
        nota_fabrica: {
          not: null,
        },
        estado: {
          in: ['ACTIVA', 'EN PRODUCCION'],
        },
        orden_de_produccion: {
          some: {
            estado: {
              in: ['APROBADA', 'EN PRODUCCION'],
            },
          },
        },
      },
      orderBy: { fecha_ini: 'desc' },
      include: {
        cliente: true,
        localidad: true,
      },
    })
  }

  async findObrasConPresupuestoAceptado(search?: string) {
    const whereConditions: Prisma.obraWhereInput = {
      presupuesto: {
        some: {
          fecha_aceptacion: {
            not: null,
          },
        },
      },
    }

    // Filtro de búsqueda mejorado (cliente + dirección)
    if (search) {
      whereConditions.OR = [
        {
          direccion: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          cliente: {
            OR: [
              {
                razon_social: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                nombre: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                apellido: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      ]
    }

    return await this.prisma.obra.findMany({
      where: whereConditions,
      orderBy: { cod_obra: 'desc' },
      include: {
        cliente: true,
        presupuesto: {
          where: {
            fecha_aceptacion: {
              not: null,
            },
          },
          orderBy: {
            fecha_aceptacion: 'desc',
          },
          take: 1,
        },
        pago: true,
      },
      take: 1000, // Limitar para performance
    })
  }
}
