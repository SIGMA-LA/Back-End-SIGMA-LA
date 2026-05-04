import { empleado_visita, Prisma } from '@prisma/client'
import { VisitaEmpleadoRepository } from './visitaEmpleado.repository.js'
import { AppError } from '../../shared/errors/AppError.js'
import { EmpleadoService } from '../Empleado/empleado.service.js'

/**
 * Servicio para gestionar las operaciones relacionadas con las relaciones empleado-visita.
 */
export class VisitaEmpleadoService {
  private repository: VisitaEmpleadoRepository
  private empleadoService: EmpleadoService

  constructor() {
    this.repository = new VisitaEmpleadoRepository()
    this.empleadoService = new EmpleadoService()
  }

  async create(
    data: Prisma.empleado_visitaCreateInput,
  ): Promise<empleado_visita> {
    const cuil = typeof data.empleado === 'string' ? data.empleado : data.empleado?.connect?.cuil
    if (cuil) {
      const empleado = await this.empleadoService.findByCuil(cuil) // esto ya lanza excepción si está inactivo
    }
    return await this.repository.create(data)
  }

  async findAll(): Promise<empleado_visita[]> {
    return this.repository.findAll()
  }

  async findById(
    cuil: string,
    cod_visita: number,
  ): Promise<empleado_visita> {
    const relacion = await this.repository.findById(cuil, cod_visita)
    if (!relacion) {
      throw new AppError('Relación empleado-visita no encontrada', 404, 'VISITA_EMPLEADO_NOT_FOUND')
    }
    return relacion
  }

  async update(
    cuil: string,
    cod_visita: number,
    data: Prisma.empleado_visitaUpdateInput,
  ): Promise<empleado_visita> {
    await this.findById(cuil, cod_visita)
    return await this.repository.update(cuil, cod_visita, data)
  }

  async remove(cuil: string, cod_visita: number): Promise<empleado_visita> {
    await this.findById(cuil, cod_visita)
    return await this.repository.delete(cuil, cod_visita)
  }
}
