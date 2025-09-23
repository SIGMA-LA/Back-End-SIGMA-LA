import { PagoService } from './pago.service.js'
import { Request, Response } from 'express'

const pagoService = new PagoService()

/**
 * Controlador para manejar las rutas de los pagos.
 * @class PagoController
 * @method create - Maneja la creación de un nuevo pago.
 * @method getAll - Maneja la obtención de todos los pagos.
 * @method getOne - Maneja la obtención de un pago por su código.
 * @method update - Maneja la actualización de un pago existente.
 * @method remove - Maneja la eliminación de un pago por su código.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class PagoController {
  async create(req: Request, res: Response) {
    const nuevo = await pagoService.create(req.body)
    res.status(201).json(nuevo)
  }

  async getAll(req: Request, res: Response) {
    const pagos = await pagoService.findAll()
    res.status(200).json(pagos)
  }

  async getOne(req: Request, res: Response) {
    const cod_pago = parseInt(req.params.cod_pago, 10)
    const pago = await pagoService.findById(cod_pago)
    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' })
    }
    res.json(pago)
  }

  async update(req: Request, res: Response) {
    const cod_pago = parseInt(req.params.cod_pago, 10)
    const pago = await pagoService.update(cod_pago, req.body)
    res.json(pago)
  }

  async remove(req: Request, res: Response) {
    const cod_pago = parseInt(req.params.cod_pago, 10)
    const pago = await pagoService.remove(cod_pago)
    res.json(pago)
  }
}
