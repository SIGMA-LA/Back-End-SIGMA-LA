import { PresupuestoService } from './presupuesto.service.js'
import { Request, Response } from 'express'

const presupuestoService = new PresupuestoService()

export class PresupuestoController {
  async create(req: Request, res: Response) {
    const nueva = await presupuestoService.create(req.body)
    res.status(201).json(nueva)
  }

  async getAll(req: Request, res: Response) {
    const presupuesto = await presupuestoService.findAll()
    res.status(201).json(presupuesto)
  }

  async getOne(req: Request, res: Response) {
    const { fecha_emision, cod_obra } = req.params

    const obra = await presupuestoService.findById(
      new Date(fecha_emision),
      parseInt(cod_obra),
    )
    if (!obra) {
      return res.status(404).json({ message: 'Obra no encontrada' })
    }
    res.json(obra)
  }

  async update(req: Request, res: Response) {
    const { fecha_emision, cod_obra } = req.params
    const obra = await presupuestoService.update(
      new Date(fecha_emision),
      parseInt(cod_obra),
      req.body,
    )
    res.json(obra)
  }

  async remove(req: Request, res: Response) {
    const { fecha_emision, cod_obra } = req.params
    const obra = await presupuestoService.remove(
      new Date(fecha_emision),
      parseInt(cod_obra),
    )
    res.json(obra)
  }
}
