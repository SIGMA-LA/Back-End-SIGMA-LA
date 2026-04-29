import { Prisma, cliente } from '@prisma/client'
import { ClienteRepository } from './cliente.repository.js'
import { AppError } from '../../shared/errors/AppError.js'
import type { PaginationParams, PaginatedResponse } from '../../shared/types/pagination.js'

export interface ClienteDependencyDetails {
  obras: number
  visitasConObra: number
  visitasInicialesSinObra: number
}

/**
 * Servicio para manejar operaciones CRUD de clientes.
 */
export class ClienteService {
  private repository: ClienteRepository

  constructor() {
    this.repository = new ClienteRepository()
  }

  async create(data: Prisma.clienteCreateInput): Promise<cliente> {
    if (!data.cuil) {
      throw new AppError('El CUIL es requerido.', 400, 'INVALID_CLIENTE_DATA')
    }
    const cuilNormalized = data.cuil.split("-").join("")
    const existingCliente = await this.repository.findById(cuilNormalized)
    if (existingCliente) {
      throw new AppError('Ya existe un cliente con el mismo CUIL.', 409, 'DUPLICATE_CLIENTE')
    }
    return await this.repository.create({ ...data, cuil: cuilNormalized })
  }

  async findAll(
    search?: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<cliente>> {
    const { data, total } = await this.repository.findAll(search, pagination)

    if (!pagination) {
       return { data, total, totalPages: 1, page: 1, pageSize: Math.max(total, 1) }
    }

    const totalPages = Math.ceil(total / pagination.pageSize) || 1

    return {
      data,
      total,
      totalPages,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }

  async findById(cuil: string): Promise<cliente> {
    const cuilNormalized = cuil.replace(/-/g, '')
    const cliente = await this.repository.findById(cuilNormalized)

    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404, 'CLIENTE_NOT_FOUND')
    }
    return cliente
  }

  async update(
    cuil: string,
    data: Prisma.clienteUpdateInput,
  ): Promise<cliente> {
    const cliente = await this.findById(cuil) // Throws if not found
    return await this.repository.update(cliente.cuil, data)
  }

  async remove(cuil: string): Promise<void> {
    const cliente = await this.findById(cuil) // Throws if not found

    const dependencyCounts = await this.repository.countDeleteDependencies(cliente.cuil)

    if (
      dependencyCounts.obras > 0 ||
      dependencyCounts.visitasConObra > 0 ||
      dependencyCounts.visitasInicialesSinObra > 0
    ) {
      throw new AppError(
        'No se puede eliminar el cliente porque tiene obras o visitas asociadas. Debe desvincularlas antes.',
        409,
        'CLIENTE_HAS_DEPENDENCIES',
        true,
        dependencyCounts
      )
    }

    try {
      await this.repository.delete(cliente.cuil)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        const refreshedDependencyCounts =
          await this.repository.countDeleteDependencies(cliente.cuil)
        throw new AppError(
          'No se puede eliminar el cliente debido a dependencias detectadas.',
          409,
          'CLIENTE_HAS_DEPENDENCIES',
          true,
          refreshedDependencyCounts
        )
      }

      throw error
    }
  }
}

