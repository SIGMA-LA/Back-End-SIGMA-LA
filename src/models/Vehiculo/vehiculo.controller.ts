import { Request, Response } from 'express'
import { vehiculoService } from './vehiculo.service.js'

/**
 * Controlador para manejar las rutas de vehiculos.
 * @class VehiculoController
 * @method create - Maneja la creación de un nuevo vehiculo.
 * @method getAll - Maneja la obtención de todos los vehiculos.
 * @method getOne - Maneja la obtención de un vehiculo por su patente.
 * @method update - Maneja la actualización de un vehiculo existente.
 * @method remove - Maneja la eliminación de un vehiculo por su patente.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */

export class VehiculoController {
  async create(req: Request, res: Response) {
    const vehiculo = await vehiculoService.create(req.body)
    res.status(201).json(vehiculo)
  }

  async getAll(req: Request, res: Response) {
    const vehiculos = await vehiculoService.findAll()
    res.json(vehiculos)
  }

  async getOne(req: Request, res: Response) {
    const patente = req.params.patente
    const vehiculo = await vehiculoService.findByPatente(patente)
    if (!vehiculo) {
      return res.status(404).json({ message: 'Vehiculo no encontrado' })
    }
    res.json(vehiculo)
  }

  async update(req: Request, res: Response) {
    const patente = req.params.patente
    const vehiculo = await vehiculoService.update(patente, req.body)
    res.json(vehiculo)
  }

  async remove(req: Request, res: Response) {
    const patente = req.params.patente
    const vehiculo = await vehiculoService.remove(patente)
    res.json(vehiculo)
  }
}

export const vehiculoController = new VehiculoController()
