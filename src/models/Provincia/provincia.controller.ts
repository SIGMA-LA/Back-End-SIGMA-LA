import { Request, Response } from 'express'
import { ProvinciaService } from './provincia.service.js'

const provinciaService = new ProvinciaService()

export class ProvinciaController {
  async create(req: Request, res: Response) {
    const provincia = await provinciaService.create(req.body)
    res.status(201).json(provincia)
  }

  async getAll(req: Request, res: Response) {
    const provincias = await provinciaService.findAll()
    res.json(provincias)
  }
}
