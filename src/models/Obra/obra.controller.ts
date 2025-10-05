import { ObraService } from './obra.service.js'
import { Request, Response } from 'express'

const obraService = new ObraService()

/**
 * Controlador para manejar las rutas de las obras.
 * @class EmpleadoController
 * @method create - Maneja la creación de nueva obra.
 * @method getAll - Maneja la obtención de todos las obras.
 * @method getOne - Maneja la obtención de una obra por su codigo de obra.
 * @method update - Maneja la actualización de un obra existente.
 * @method remove - Maneja la eliminación de una obra por su codigo de obra.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class ObraController {
  async create(req: Request, res: Response) {
    const nueva = await obraService.create(req.body)
    res.status(201).json(nueva)
  }

  async getAll(req: Request, res: Response) {
    const obras = await obraService.findAll()
    res.status(201).json(obras)
  }

  async getOne(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    const obra = await obraService.findById(id)
    if (!obra) {
      return res.status(404).json({ message: 'Obra no encontrada' })
    }
    res.json(obra)
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    const obra = await obraService.update(id, req.body)
    res.json(obra)
  }

  async remove(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    const obra = await obraService.remove(id)
    res.json(obra)
  }

  async getNotasSinOrdenAprobada(req: Request, res: Response) {
    const obras = await obraService.findNotasSinOrdenAprobada()
    res.json(obras)
  }

  async getNotasConOrdenEnProceso(req: Request, res: Response) {
    const obras = await obraService.findNotasConOrdenEnProceso()
    res.json(obras)
  }
}
