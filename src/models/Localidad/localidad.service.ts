import { localidad, Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Servicio para manejar operaciones CRUD de localidades.
 * @class LocalidadService
 * @method create - Crea una nueva localidad.
 * @method findAll - Obtiene todas las localidades.
 * @method findById - Obtiene una localidad por su código postal.
 * @method update - Actualiza una localidad existente.
 * @method remove - Elimina una localidad por su código postal.
 * @returns {Promise<localidad | localidad[] | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class LocalidadService {
  async create(data: Prisma.localidadCreateInput): Promise<localidad> {
    return prisma.localidad.create({ data })
  }

  async findAll(): Promise<localidad[]> {
    return prisma.localidad.findMany()
  }

  async findById(cod_postal: number): Promise<localidad | null> {
    return prisma.localidad.findUnique({ where: { cod_postal } })
  }

  async update(
    cod_postal: number,
    data: Prisma.localidadUpdateInput,
  ): Promise<localidad> {
    return prisma.localidad.update({
      where: { cod_postal },
      data,
    })
  }

  async remove(cod_postal: number): Promise<localidad> {
    return prisma.localidad.delete({ where: { cod_postal } })
  }
}
