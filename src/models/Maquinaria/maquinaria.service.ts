import { PrismaClient, Prisma, maquinaria } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Servicio para manejar operaciones CRUD de maquinaria.
 * @class MaquinariaService
 * @method create - Crea una nueva maquinaria.
 * @method findAll - Obtiene todas las maquinarias.
 * @method findById - Obtiene una maquinaria por su código.
 * @method update - Actualiza una maquinaria existente.
 * @method remove - Elimina una maquinaria por su código.
 * @returns {Promise<maquinaria | maquinaria[] | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class MaquinariaService {
  async create(data: Prisma.maquinariaCreateInput): Promise<maquinaria> {
    return prisma.maquinaria.create({ data })
  }

  async findAll(): Promise<maquinaria[]> {
    return prisma.maquinaria.findMany()
  }

  async findById(cod_maquina: number): Promise<maquinaria | null> {
    return prisma.maquinaria.findUnique({ where: { cod_maquina } })
  }

  async update(
    cod_maquina: number,
    data: Prisma.maquinariaUpdateInput,
  ): Promise<maquinaria> {
    return prisma.maquinaria.update({
      where: { cod_maquina },
      data,
    })
  }

  async remove(cod_maquina: number): Promise<maquinaria> {
    return prisma.maquinaria.delete({ where: { cod_maquina } })
  }
}
