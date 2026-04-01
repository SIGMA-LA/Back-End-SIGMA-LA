import { PrismaClient, obra, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prismaClient.js'

export type NotasFabricaEstado =
  | 'SIN_ORDEN'
  | 'EN_PRODUCCION'
  | 'FINALIZADA'

export interface NotasFabricaFilters {
  estado: NotasFabricaEstado
  fechaDesde?: string
  fechaHasta?: string
}

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

  /** Obtiene obras de un cliente específico */
  async findByCliente(cuil_cliente: string) {
    return this.prisma.obra.findMany({
      where: {
        cliente: {
          cuil: cuil_cliente,
        },
      },
      include: {
        localidad: {
          include: {
            provincia: true,
          },
        },
      },
      orderBy: { cod_obra: 'desc' },
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
  ): Promise<obra> {
    return await this.prisma.obra.update({
      where: { cod_obra: id },
      data: {
        nota_fabrica: path,
        nota_fabrica_pid: filename,
      },
    })
  }

  async findNotasFabrica(filters: NotasFabricaFilters): Promise<obra[]> {
    const andConditions: Prisma.obraWhereInput[] = [
      {
        OR: [{ nota_fabrica: { not: null } }, { nota_fabrica_pid: { not: null } }],
      },
    ]

    if (filters.estado === 'SIN_ORDEN') {
      andConditions.push({
        orden_de_produccion: {
          none: {},
        },
      })
    }

    if (filters.estado === 'EN_PRODUCCION') {
      andConditions.push({
        orden_de_produccion: {
          some: {
            estado: {
              not: 'FINALIZADA',
            },
          },
        },
      })
      andConditions.push({
        estado: {
          notIn: ['FINALIZADA'],
        },
      })
    }

    if (filters.estado === 'FINALIZADA') {
      andConditions.push({ estado: 'FINALIZADA' })
    }

    if (filters.fechaDesde || filters.fechaHasta) {
      const fechaIniFilter: Prisma.DateTimeFilter = {}

      if (filters.fechaDesde) {
        const fechaDesde = new Date(`${filters.fechaDesde}T00:00:00`)
        fechaIniFilter.gte = fechaDesde
      }

      if (filters.fechaHasta) {
        const fechaHasta = new Date(`${filters.fechaHasta}T23:59:59.999`)
        fechaIniFilter.lte = fechaHasta
      }

      andConditions.push({ fecha_ini: fechaIniFilter })
    }

    return await this.prisma.obra.findMany({
      where: {
        AND: andConditions,
      },
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
    // Borramos el presupuesto asociado a la obra que es el unico registro que tiene
    await this.prisma.presupuesto.deleteMany({
      where: { cod_obra: id },
    })
    // Borramos la obra
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

  /**
   * Obtiene obras filtradas para creación de entregas según si es parcial o final
   */
  async findObrasParaEntrega(search: string | undefined, esFinal: boolean): Promise<obra[]> {
    const whereConditions: Prisma.obraWhereInput = {}

    // Condición principal del estado
    if (esFinal) {
      whereConditions.estado = 'PAGADA TOTALMENTE'
    } else {
      whereConditions.estado = {
        in: ['EN PRODUCCION', 'PRODUCCION FINALIZADA', 'PAGADA TOTALMENTE'],
      }
    }

    // Filtro de búsqueda (cliente + dirección) si se provee search
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
        localidad: {
          include: {
            provincia: true,
          },
        },
      },
      take: 20, // Limitamos para buen performance
    })
  }
}
