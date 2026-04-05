import { entrega_empleado, Prisma } from '@prisma/client'
import { EntregaEmpleadoRepository } from './entregaEmpleado.repository.js'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Servicio para gestionar las operaciones relacionadas con las relaciones entrega-empleado.
 */
export class EntregaEmpleadoService {
  private repository: EntregaEmpleadoRepository

  constructor() {
    this.repository = new EntregaEmpleadoRepository()
  }

  async create(
    data: Prisma.entrega_empleadoCreateInput,
  ): Promise<entrega_empleado> {
    return await this.repository.create(data)
  }

  async findAll(): Promise<entrega_empleado[]> {
    return this.repository.findAll()
  }

  async findById(
    cod_entrega: number,
    cuil: string,
  ): Promise<entrega_empleado> {
    const relacion = await this.repository.findById(cod_entrega, cuil)
    if (!relacion) {
      throw new AppError('Relación entrega-empleado no encontrada', 404, 'ENTREGA_EMPLEADO_NOT_FOUND')
    }
    return relacion
  }

  async update(
    cod_entrega: number,
    cuil: string,
    data: Prisma.entrega_empleadoUpdateInput,
  ): Promise<entrega_empleado> {
    await this.findById(cod_entrega, cuil)
    return await this.repository.update(cod_entrega, cuil, data)
  }

  async remove(cod_entrega: number, cuil: string): Promise<entrega_empleado> {
    await this.findById(cod_entrega, cuil)
    return await this.repository.delete(cod_entrega, cuil)
  }
}
