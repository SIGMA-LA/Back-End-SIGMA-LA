import { empleado_visita, Prisma } from '@prisma/client'
import { VisitaEmpleadoRepository } from './visitaEmpleado.repository.js'

export class VisitaEmpleadoService {
  private repository: VisitaEmpleadoRepository

  constructor() {
    this.repository = new VisitaEmpleadoRepository()
  }

  async create(
    data: Prisma.empleado_visitaCreateInput,
  ): Promise<empleado_visita> {
    return await this.repository.create(data)
  }

  async findAll(): Promise<empleado_visita[]> {
    return this.repository.findAll()
  }

  async findById(
    cuil: string,
    cod_visita: number,
  ): Promise<empleado_visita | null> {
    return await this.repository.findById(cuil, cod_visita)
  }

  async update(
    cuil: string,
    cod_visita: number,
    data: Prisma.empleado_visitaUpdateInput,
  ): Promise<empleado_visita> {
    return await this.repository.update(cuil, cod_visita, data)
  }

  async delete(cuil: string, cod_visita: number): Promise<empleado_visita> {
    const existingRelacion = await this.repository.findById(cuil, cod_visita)
    if (!existingRelacion) {
      throw new Error('Relación empleado-visita no encontrada')
    }
    return await this.repository.delete(cuil, cod_visita)
  }
}
