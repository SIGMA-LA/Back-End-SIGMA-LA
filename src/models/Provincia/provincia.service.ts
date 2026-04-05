import { provincia, Prisma } from '@prisma/client'
import { ProvinciaRepository } from './provincia.repository.js'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Service to manage province (provincia) operations.
 */
export class ProvinciaService {
  private repository: ProvinciaRepository

  constructor() {
    this.repository = new ProvinciaRepository()
  }

  /**
   * Finds a province by its ID (cod_provincia).
   */
  async findById(cod_provincia: number): Promise<provincia> {
    const entry = await this.repository.findById(cod_provincia)
    if (!entry) {
      throw new AppError('Provincia no encontrada', 404, 'PROVINCIA_NOT_FOUND')
    }
    return entry
  }

  /**
   * Creates a new province record.
   */
  async create(data: Prisma.provinciaCreateInput): Promise<provincia> {
    return await this.repository.create(data)
  }

  /**
   * Gets all province records.
   */
  async findAll(): Promise<provincia[]> {
    return await this.repository.findAll()
  }
}

