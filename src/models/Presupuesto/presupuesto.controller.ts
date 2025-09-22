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
    const { nro_presupuesto } = req.params
    const presupuesto = await presupuestoService.findById(
      Number(nro_presupuesto),
    )
    if (!presupuesto) {
      return res.status(404).json({ message: 'Presupuesto no encontrado' })
    }
    res.json(presupuesto)
  }

  async update(req: Request, res: Response) {
    const { nro_presupuesto } = req.params
    const presupuesto = await presupuestoService.update(
      Number(nro_presupuesto),
      req.body,
    )
    res.json(presupuesto)
  }

  async remove(req: Request, res: Response) {
    const { nro_presupuesto } = req.params
    const presupuesto = await presupuestoService.remove(Number(nro_presupuesto))
    res.json(presupuesto)
  }
}
