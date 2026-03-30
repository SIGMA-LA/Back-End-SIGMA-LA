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
    const cod_entrega = Number(req.params.cod_entrega)
    const patente = req.params.patente
    const uso = await usoService.findById(cod_entrega, patente)
    if (!uso) {
      return res
        .status(404)
        .json({ message: 'Uso de vehículo en entrega no encontrado' })
    }
    res.json(uso)
  }

  async update(req: Request, res: Response) {
    const cod_entrega = Number(req.params.cod_entrega)
    const patente = req.params.patente
    const uso = await usoService.update(cod_entrega, patente, req.body)
    res.json(uso)
  }

  async remove(req: Request, res: Response) {
    const cod_entrega = Number(req.params.cod_entrega)
    const patente = req.params.patente
    const uso = await usoService.remove(cod_entrega, patente)
    res.json(uso)
  }
}
