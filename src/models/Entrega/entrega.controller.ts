import { Request, Response } from 'express'
import { EntregaService } from './entrega.service.js'

const entregaService = new EntregaService()

/**
 * Controlador para manejar las rutas de entregas.
 * @class EntregaController
 * @method create - Maneja la creación de una nueva entrega.
 * @method getAll - Maneja la obtención de todas las entregas.
 * @method getOne - Maneja la obtención de una entrega por su ID.
 * @method update - Maneja la actualización de una entrega existente.
 * @method remove - Maneja la eliminación de una entrega por su ID.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */

export class EntregaController {
  async create(req: Request, res: Response) {
    const entrega = await entregaService.create(req.body)
    res.status(201).json(entrega)
  }

  async getAll(req: Request, res: Response) {
    const entregas = await entregaService.findAll()
    res.json(entregas)
  }

  async getOne(req: Request, res: Response) {
    const cod_entrega = parseInt(req.params.cod_entrega)
    const entrega = await entregaService.findById(cod_entrega)
    if (!entrega) {
      return res.status(404).json({ message: 'Entrega no encontrada' })
    }
    res.json(entrega)
  }

  async update(req: Request, res: Response) {
    const cod_entrega = parseInt(req.params.cod_entrega)
    const entrega = await entregaService.update(cod_entrega, req.body)
    res.json(entrega)
  }

  async remove(req: Request, res: Response) {
    const cod_entrega = parseInt(req.params.cod_entrega)
    const entrega = await entregaService.delete(cod_entrega)
    res.json(entrega)
  }

  async getEntregasByEmpleadoEstado(req: Request, res: Response) {
    const { cuil_empleado, estado } = req.params
    const entregas = await entregaService.getByEmpleadoEstado(
      cuil_empleado,
      estado,
    )
    res.json(entregas)
  }
}
