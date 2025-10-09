import { Request, Response } from 'express'
import { LocalidadService } from './localidad.service.js'

const localidadService = new LocalidadService()

/**
 * LocalidadController
 * @class LocalidadController
 * @method create - Maneja la creación de una nueva localidad.
 * @method getAll - Maneja la obtención de todas las localidades.
 * @method getOne - Maneja la obtención de una localidad por su ID.
 * @method update - Maneja la actualización de una localidad existente.
 * @method remove - Maneja la eliminación de una localidad por su ID.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class LocalidadController {
  async create(req: Request, res: Response) {
    const localidad = await localidadService.create(req.body)
    res.status(201).json(localidad)
  }
  async getByProvincia(provinciaId: number, req: Request, res: Response) {
    const localidades = await localidadService.findByProvincia(provinciaId)
    res.json(localidades)
  }

  async getAll(req: Request, res: Response) {
    const localidades = await localidadService.findAll()
    res.json(localidades)
  }

  async getOne(req: Request, res: Response) {
    const id = parseInt(req.params.id)
    const localidad = await localidadService.findById(id)
    if (!localidad) {
      return res.status(404).json({ message: 'Localidad no encontrada' })
    }
    res.json(localidad)
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id)
    const localidad = await localidadService.update(id, req.body)
    res.json(localidad)
  }

  async remove(req: Request, res: Response) {
    const id = parseInt(req.params.id)
    const localidad = await localidadService.remove(id)
    res.json(localidad)
  }
}
