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
    const { fecha_cambio, hora_cambio } = req.params
    const parametro = await parametroService.findById(
      new Date(fecha_cambio),
      new Date(hora_cambio),
    )
    if (!parametro) {
      return res.status(404).json({ message: 'Parametro no encontrado' })
    }
    res.json(parametro)
  }

  async update(req: Request, res: Response) {
    const { fecha_cambio, hora_cambio } = req.params
    const parametro = await parametroService.update(
      new Date(fecha_cambio),
      new Date(hora_cambio),
      req.body,
    )
    res.json(parametro)
  }

  async remove(req: Request, res: Response) {
    const { fecha_cambio, hora_cambio } = req.params
    const parametro = await parametroService.remove(
      new Date(fecha_cambio),
      new Date(hora_cambio),
    )
    res.json(parametro)
  }
}
