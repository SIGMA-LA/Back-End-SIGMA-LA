import { PrismaClient, obra, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

/**
 * Repositorio para acceder a la base de datos de obras.
 */
export class ObraRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  // ----------- FILTROS Y BÚSQUEDAS -----------

  async findAll() {
    return await this.prisma.obra.findMany({
      orderBy: { cod_obra: 'desc' },
      include: {
        cliente: true,
        arquitecto: true,
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
  /** Filtra obras por estado, localidad o ambos */
  async filtrar({
    estado,
    cod_localidad,
  }: {
    estado?: string
    cod_localidad?: number
  }) {
    if (!estado && !cod_localidad) {
      return this.prisma.obra.findMany({
        include: {
          cliente: true,
          arquitecto: true,
          localidad: {
            include: {
              provincia: true,
            },
          },
        },
        orderBy: { fecha_ini: 'desc' },
      })
    }
    return this.prisma.obra.findMany({
      where: {
        ...(estado && { estado }),
        ...(cod_localidad && { cod_localidad }),
      },
      include: {
        cliente: true,
        arquitecto: true,
        localidad: {
          include: {
            provincia: true,
          },
        },
      },
      orderBy: { fecha_ini: 'desc' },
    })
  }

  /** Busca obras por texto (dirección, cliente, etc.) */
  async buscar(q: string) {
    return this.prisma.obra.findMany({
      where: {
        OR: [
          { direccion: { contains: q, mode: 'insensitive' } },
          { cliente: { razon_social: { contains: q, mode: 'insensitive' } } },
          { cliente: { nombre: { contains: q, mode: 'insensitive' } } },
          { cliente: { apellido: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: {
        cliente: true,
        arquitecto: true,
        localidad: {
          include: {
            provincia: true,
          },
        },
      },
      orderBy: { cod_obra: 'desc' },
      take: 10,
    })
  }

  /** Obtiene una obra por ID */
  async findById(id: number): Promise<obra | null> {
    return await this.prisma.obra.findUnique({
      where: { cod_obra: id },
      include: {
        cliente: true,
        arquitecto: true,
        localidad: true,
        presupuesto: true,
        visita: true,
        pago: true,
        entrega: true,
      },
    })
  }

  // ----------- NOTA DE FÁBRICA -----------

  /** Sube nota de fábrica a una obra */
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

  /** Obtiene obras con nota de fábrica sin orden aprobada */
  async findNotasSinOrdenAprobada(): Promise<obra[]> {
    return await this.prisma.obra.findMany({
      where: {
        nota_fabrica: {
          not: null,
        },
        estado: {
          in: ['PAGADA PARCIALMENTE'],
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

  /** Obtiene obras con nota de fábrica y orden en proceso */
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
  // ----------- CRUD DE OBRAS -----------

  /** Crea una nueva obra */
  async create(data: Prisma.obraCreateInput): Promise<obra> {
    return await this.prisma.obra.create({
      data,
    })
  }

  /** Actualiza una obra por ID */
  async update(id: number, data: Prisma.obraUpdateInput): Promise<obra> {
    return await this.prisma.obra.update({
      where: { cod_obra: id },
      data,
    })
  }

  /** Baja lógica de una obra (cambia estado a CANCELADA) */
  async bajaLogica(id: number): Promise<obra | null> {
    const obra = await this.prisma.obra.findUnique({
      where: { cod_obra: id },
    })
    if (!obra) {
      return null
    }
    return await this.prisma.obra.update({
      where: { cod_obra: id },
      data: { estado: 'CANCELADA' },
    })
  }

  /** Elimina una obra por ID (baja física) */
  async delete(id: number): Promise<obra> {
    return await this.prisma.obra.delete({
      where: { cod_obra: id },
    })
  }

  /**
   * Obtiene obras de empresas con estado 'PAGADA PARCIALMENTE'
   */
  async findObrasParaPedidoStock(): Promise<obra[]> {
    return this.prisma.obra.findMany({
      where: {
        estado: 'PAGADA PARCIALMENTE',
        cliente: {
          tipo_cliente: 'EMPRESA',
        },
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
}
