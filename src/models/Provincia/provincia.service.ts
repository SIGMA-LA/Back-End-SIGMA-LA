import { provincia, Prisma } from '@prisma/client'
import { ProvinciaRepository } from './provincia.repository.js'

export class ProvinciaService {
  private repository: ProvinciaRepository

  constructor() {
    this.repository = new ProvinciaRepository()
  }
  async findById(cod_provincia: number): Promise<provincia | null> {
    return await this.repository.findById(cod_provincia)
  }

  async create(data: Prisma.provinciaCreateInput): Promise<provincia> {
    return await this.repository.create(data)
  }

  async findAll(): Promise<provincia[]> {
    return await this.repository.findAll()
  }
}
