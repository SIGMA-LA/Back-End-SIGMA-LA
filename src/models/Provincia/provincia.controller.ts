import { Request, Response } from 'express'
import { ProvinciaService } from './provincia.service.js'

const provinciaService = new ProvinciaService()

export class ProvinciaController {
  async create(req: Request, res: Response) {
    const provincia = await provinciaService.create(req.body)
    res.status(201).json(provincia)
  }
  async getOne(req: Request, res: Response) {
    const cod_provincia = parseInt(req.params.id, 10)
    const provincia = await provinciaService.findById(cod_provincia)
    if (provincia) {
      res.json(provincia)
    } else {
      res.status(404).json({ message: 'Provincia no encontrada' })
    }
  }

  async getAll(req: Request, res: Response) {
    const provincias = await provinciaService.findAll()
    res.json(provincias)
  }
}
