import { OrdenProduccionService } from './ordenProduccion.service.js'
import { Request, Response } from 'express'

const ordenService = new OrdenProduccionService()

/**
 * Controlador para manejar las rutas de las órdenes de producción.
 * @class OrdenProduccionController
 * @method create - Maneja la creación de nueva orden de producción.
 * @method getAll - Maneja la obtención de todos las órdenes de producción.
 * @method getOne - Maneja la obtención de una orden de producción por su código.
 * @method update - Maneja la actualización de una orden de producción existente.
 * @method remove - Maneja la eliminación de una orden de producción por su código.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class OrdenProduccionController {
  async create(req: Request, res: Response) {
    const nueva = await ordenService.create(req.body)
    res.status(201).json(nueva)
  }

  async getAll(req: Request, res: Response) {
    const ordenes = await ordenService.findAll()
    res.status(201).json(ordenes)
  }

  async getOne(req: Request, res: Response) {
    const cod_orden = parseInt(req.params.cod_orden, 10)
    const orden = await ordenService.findById(cod_orden)
    if (!orden) {
      return res
        .status(404)
        .json({ message: 'Orden de producción no encontrada' })
    }
    res.json(orden)
  }

  async update(req: Request, res: Response) {
    const cod_orden = parseInt(req.params.cod_orden, 10)
    const orden = await ordenService.update(cod_orden, req.body)
    res.json(orden)
  }

  async remove(req: Request, res: Response) {
    const cod_orden = parseInt(req.params.cod_orden, 10)
    const orden = await ordenService.remove(cod_orden)
    res.json(orden)
  }
}
