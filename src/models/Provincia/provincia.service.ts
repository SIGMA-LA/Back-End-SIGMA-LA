import { provincia, Prisma } from '@prisma/client'
import { ProvinciaRepository } from './provincia.repository.js'

export class ProvinciaService {
  private repository: ProvinciaRepository

  constructor() {
    this.repository = new ProvinciaRepository()
  }

  async create(data: Prisma.provinciaCreateInput): Promise<provincia> {
    return await this.repository.create(data)
  }

  async findAll(): Promise<provincia[]> {
    return await this.repository.findAll()
  }

}
