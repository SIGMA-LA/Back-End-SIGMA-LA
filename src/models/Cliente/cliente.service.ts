import { Prisma, cliente } from '@prisma/client'
import { ClienteRepository } from './cliente.repository.js'

export interface ClienteDependencyDetails {
  obras: number
  visitasConObra: number
  visitasInicialesSinObra: number
}

export type ClienteRemoveResult =
  | { status: 'deleted'; cliente: cliente }
  | { status: 'not_found' }
  | { status: 'has_dependencies'; details: ClienteDependencyDetails }

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
  private repository: ClienteRepository

  constructor() {
    this.repository = new ClienteRepository()
  }

  async create(data: Prisma.clienteCreateInput): Promise<cliente> {
    // Asegurarse de que data.cuil es string
    const existingCliente = await this.repository.findById(data.cuil)
    if (existingCliente) {
      throw new Error('Ya existe un cliente con el mismo CUIL.')
    }
    return await this.repository.create(data)
  }

  async findAll(): Promise<cliente[]> {
    return await this.repository.findAll()
  }

  async findById(cuil: string): Promise<cliente | null> {
    return await this.repository.findById(cuil)
  }

  async getObrasByCuil(cuil: string) {
    return await this.repository.getObrasByCuil(cuil)
  }

  async buscar(q: string, page = 1, pageSize = 25): Promise<cliente[]> {
    const limit = Math.max(1, Math.min(100, pageSize))
    const offset = (Math.max(1, page) - 1) * limit
    return await this.repository.buscar(q, limit, offset)
  }

  async update(
    cuil: string,
    data: Prisma.clienteUpdateInput,
  ): Promise<cliente> {
    const existingCliente = await this.repository.findById(cuil)
    if (!existingCliente) {
      throw new Error('No existe un cliente con el CUIL proporcionado.')
    }
    return await this.repository.update(cuil, data)
  }

  async remove(cuil: string): Promise<ClienteRemoveResult> {
    const existingCliente = await this.repository.findById(cuil)
    if (!existingCliente) {
      return { status: 'not_found' }
    }

    const dependencyCounts = await this.repository.countDeleteDependencies(cuil)

    if (
      dependencyCounts.obras > 0 ||
      dependencyCounts.visitasConObra > 0 ||
      dependencyCounts.visitasInicialesSinObra > 0
    ) {
      return {
        status: 'has_dependencies',
        details: dependencyCounts,
      }
    }

    try {
      const deletedCliente = await this.repository.delete(cuil)
      return { status: 'deleted', cliente: deletedCliente }
    } catch (error: unknown) {
      // Safety net for concurrent writes between dependency check and delete.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        const refreshedDependencyCounts =
          await this.repository.countDeleteDependencies(cuil)
        return {
          status: 'has_dependencies',
          details: refreshedDependencyCounts,
        }
      }

      throw error
    }
  }
}
