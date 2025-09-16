import { Request, Response } from 'express'
import { visitaService } from './visita.service.js'

/**
 * Controlador para manejar las rutas de visitas.
 * @class VisitaController
 * @method create - Maneja la creación de una nueva visita.
 * @method getAll - Maneja la obtención de todas las visitas.
 * @method getOne - Maneja la obtención de una visita por su cod_visita.
 * @method update - Maneja la actualización de una visita existente.
 * @method remove - Maneja la eliminación de una visita por su cod_visita.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */

export class VisitaController {
  async create(req: Request, res: Response) {
    const visita = await visitaService.create(req.body)
    res.status(201).json(visita)
  }

  async getAll(req: Request, res: Response) {
    const visitas = await visitaService.findAll()
    res.json(visitas)
  }

  async getOne(req: Request, res: Response) {
    const { id } = req.params
    const visita = await visitaService.findById(Number(id))
    if (!visita) {
      return res.status(404).json({ message: 'Visita no encontrada' })
    }
    res.json(visita)
  }

  async update(req: Request, res: Response) {
    const { id } = req.params
    const visita = await visitaService.update(Number(id), req.body)
    res.json(visita)
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params
    const visita = await visitaService.remove(Number(id))
    res.json(visita)
  }
}

export const visitaController = new VisitaController()
