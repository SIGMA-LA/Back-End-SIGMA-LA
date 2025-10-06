import { ParametroService } from './parametro.service.js'
import { Request, Response } from 'express'

const parametroService = new ParametroService()

/**
 * Controlador para manejar las solicitudes relacionadas con los parámetros.
 * @class ParametroController
 * @method create - Crea un nuevo parámetro.
 * @method getAll - Obtiene todos los parámetros.
 * @method getOne - Obtiene un parámetro por su clave primaria compuesta (fecha_cambio y hora_cambio).
 * @method update - Actualiza un parámetro existente.
 * @method remove - Elimina un parámetro existente.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class ParametroController {
  async create(req: Request, res: Response) {
    const parametro = await parametroService.create(req.body)
    res.status(201).json(parametro)
  }

  async getAll(req: Request, res: Response) {
    const parametro = await parametroService.findAll()
    res.json(parametro)
  }

  async getOne(req: Request, res: Response) {
    const { id } = req.params
    const parametro = await parametroService.findById(Number(id))
    if (!parametro) {
      return res.status(404).json({ message: 'Parametro no encontrado' })
    }
    res.json(parametro)
  }

  async getActualViatico(req: Request, res: Response) {
    const viatico = await parametroService.findActualViatico();
    if (!viatico) {
      return res.status(404).json({ message: 'No se encontraron parámetros de viáticos configurados.' });
    }
    res.json(viatico);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params
    const parametro = await parametroService.update(Number(id), req.body)
    res.json(parametro)
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params
    const parametro = await parametroService.remove(Number(id))
    res.json(parametro)
  }
}
