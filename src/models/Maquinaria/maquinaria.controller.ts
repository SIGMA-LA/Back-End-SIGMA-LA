import { Request, Response } from 'express'
import { MaquinariaService } from './maquinaria.service.js'

const maquinariaService = new MaquinariaService()

/**
 * Controlador para manejar las rutas de maquinaria.
 * @class MaquinariaController
 * @method create - Maneja la creación de una nueva maquinaria.
 * @method getAll - Maneja la obtención de todas las maquinarias.
 * @method getOne - Maneja la obtención de una maquinaria por su código.
 * @method update - Maneja la actualización de una maquinaria existente.
 * @method remove - Maneja la eliminación de una maquinaria por su código.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class MaquinariaController {
  async create(req: Request, res: Response) {
    const nueva = await maquinariaService.create(req.body)
    res.status(201).json(nueva)
  }

  async getAll(req: Request, res: Response) {
    const maquinas = await maquinariaService.findAll()
    res.json(maquinas)
  }

  async getOne(req: Request, res: Response) {
    const cod_maquina = parseInt(req.params.cod_maquina, 10)
    const maquina = await maquinariaService.findById(cod_maquina)
    if (!maquina) {
      return res.status(404).json({ message: 'Maquinaria no encontrada' })
    }
    res.json(maquina)
  }

  async update(req: Request, res: Response) {
    const cod_maquina = parseInt(req.params.cod_maquina, 10)
    const maquina = await maquinariaService.update(cod_maquina, req.body)
    res.json(maquina)
  }

  async remove(req: Request, res: Response) {
    const cod_maquina = parseInt(req.params.cod_maquina, 10)
    const maquina = await maquinariaService.remove(cod_maquina)
    res.json(maquina)
  }
}
