import { entrega_empleado, Prisma } from '@prisma/client'
import { EntregaEmpleadoRepository } from './entregaEmpleado.repository.js'

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
  ): Promise<entrega_empleado | null> {
    return await this.repository.findById(cod_entrega, cuil)
  }

  async update(
    cod_entrega: number,
    cuil: string,
    data: Prisma.entrega_empleadoUpdateInput,
  ): Promise<entrega_empleado> {
    return await this.repository.update(cod_entrega, cuil, data)
  }

  async delete(cod_entrega: number, cuil: string): Promise<entrega_empleado> {
    const existingRelacion = await this.repository.findById(cod_entrega, cuil)
    if (!existingRelacion) {
      throw new Error('Relación entrega-empleado no encontrada')
    }
    return await this.repository.delete(cod_entrega, cuil)
  }
}
