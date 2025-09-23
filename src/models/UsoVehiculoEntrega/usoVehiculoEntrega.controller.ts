import { UsoVehiculoEntregaService } from './usoVehiculoEntrega.service.js'
import { Request, Response } from 'express'

const usoService = new UsoVehiculoEntregaService()

export class UsoVehiculoEntregaController {
  async create(req: Request, res: Response) {
    const nuevoUso = await usoService.create(req.body)
    res.status(201).json(nuevoUso)
  }

  async getAll(req: Request, res: Response) {
    const usos = await usoService.findAll()
    res.status(200).json(usos)
  }

  async getOne(req: Request, res: Response) {
    const id = Number(req.params.id)
    const uso = await usoService.findById(id)
    if (!uso) {
      return res
        .status(404)
        .json({ message: 'Uso de vehículo en entrega no encontrado' })
    }
    res.json(uso)
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id)
    const uso = await usoService.update(id, req.body)
    res.json(uso)
  }

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id)
    const uso = await usoService.remove(id)
    res.json(uso)
  }
}
