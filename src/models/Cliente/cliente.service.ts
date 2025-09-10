import { PrismaClient, Prisma, cliente } from '@prisma/client'
/**
 * Servicio para manejar operaciones CRUD de clientes.
 */
const prisma = new PrismaClient()

/**
 * Servicio para manejar operaciones CRUD de clientes.
 * @class ClienteService
 * @method create - Crea un nuevo cliente.
 * @method findAll - Obtiene todos los clientes.
 * @method findById - Obtiene un cliente por su CUIL.
 * @method update - Actualiza un cliente existente.
 * @method remove - Elimina un cliente por su CUIL.
 * @returns {Promise<cliente | cliente[] | null>} - Resultado de la operación.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class ClienteService {
  async create(data: Prisma.clienteCreateInput): Promise<cliente> {
    return prisma.cliente.create({ data })
  }

  async findAll(): Promise<cliente[]> {
    return prisma.cliente.findMany()
  }

  async findById(cuil: bigint): Promise<cliente | null> {
    return prisma.cliente.findUnique({ where: { cuil } })
  }

  async update(
    cuil: bigint,
    data: Prisma.clienteUpdateInput,
  ): Promise<cliente> {
    return prisma.cliente.update({
      where: { cuil },
      data,
    })
  }

  async remove(cuil: bigint): Promise<cliente> {
    return prisma.cliente.delete({ where: { cuil } })
  }
}
