import { Prisma, maquinaria } from '@prisma/client'
import { MaquinariaRepository } from './maquinaria.repository.js'

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
  private repository: MaquinariaRepository

  constructor() {
    this.repository = new MaquinariaRepository()
  }

  async create(data: Prisma.maquinariaCreateInput): Promise<maquinaria> {
    // Establecer estado por defecto si no se proporciona
    const maquinariaData = {
      ...data,
      estado: data.estado || 'DISPONIBLE',
    }
    return await this.repository.create(maquinariaData)
  }

  async findAll(): Promise<maquinaria[]> {
    return this.repository.findAll()
  }

  async findById(cod_maquina: number): Promise<maquinaria | null> {
    return await this.repository.findById(cod_maquina)
  }

  async findDisponibles(): Promise<maquinaria[]> {
    return await this.repository.findByEstado('DISPONIBLE')
  }

  async update(
    cod_maquina: number,
    data: Prisma.maquinariaUpdateInput,
  ): Promise<maquinaria> {
    const existingMaquinaria = await this.repository.findById(cod_maquina)
    if (!existingMaquinaria) {
      throw new Error('No existe una maquinaria con el código proporcionado.')
    }
    return await this.repository.update(cod_maquina, data)
  }

  async updateEstado(cod_maquina: number, estado: string): Promise<maquinaria> {
    const existingMaquinaria = await this.repository.findById(cod_maquina)
    if (!existingMaquinaria) {
      throw new Error('No existe una maquinaria con el código proporcionado.')
    }

    // Validar estados permitidos
    const estadosValidos = [
      'DISPONIBLE',
      'EN_USO',
      'MANTENIMIENTO',
      'REPARACION',
      'FUERA_DE_SERVICIO',
    ]
    if (!estadosValidos.includes(estado)) {
      throw new Error(
        'Estado no válido. Estados permitidos: ' + estadosValidos.join(', '),
      )
    }

    return await this.repository.update(cod_maquina, { estado })
  }

  async remove(cod_maquina: number): Promise<maquinaria> {
    const existingMaquinaria = await this.repository.findById(cod_maquina)
    if (!existingMaquinaria) {
      throw new Error('No existe una maquinaria con el código proporcionado.')
    }
    return await this.repository.delete(cod_maquina)
  }
}
