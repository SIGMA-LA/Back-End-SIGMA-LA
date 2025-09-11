import { Prisma, cliente } from '@prisma/client'
import { ClienteRepository } from './cliente.repository'

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
    try {
      const existingCliente = await this.repository.findById(
        data.cuil as bigint,
      )
      if (existingCliente) {
        throw new Error('Ya existe un cliente con el mismo CUIL.')
      }
      return await this.repository.create(data)
    } catch (error) {
      throw new Error(`Error al crear el cliente: ${error}`)
    }
  }

  async findAll(): Promise<cliente[]> {
    return await this.repository.findAll()
  }

  async findById(cuil: bigint): Promise<cliente | null> {
    try {
      return await this.repository.findById(cuil)
    } catch (error) {
      throw new Error(`Error al obtener cliente: ${error}`)
    }
  }

  async update(
    cuil: bigint,
    data: Prisma.clienteUpdateInput,
  ): Promise<cliente> {
    try {
      const existingCliente = await this.repository.findById(cuil)
      if (!existingCliente) {
        throw new Error('No existe un cliente con el CUIL proporcionado.')
      }
      return await this.repository.update(cuil, data)
    } catch (error) {
      throw new Error(`Error al actualizar el cliente: ${error}`)
    }
  }

  async remove(cuil: bigint): Promise<cliente> {
    try {
      const existingCliente = await this.repository.findById(cuil)
      if (!existingCliente) {
        throw new Error('No existe un cliente con el CUIL proporcionado.')
      }
      return await this.repository.delete(cuil)
    } catch (error) {
      throw new Error(`Error al eliminar el cliente: ${error}`)
    }
  }
}
