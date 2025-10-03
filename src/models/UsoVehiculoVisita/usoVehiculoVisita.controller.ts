import { UsoVehiculoVisitaService } from './usoVehiculoVisita.service.js'
import { Request, Response } from 'express'

const usoService = new UsoVehiculoVisitaService()

/**
 * Controlador para manejar las rutas de los usos de vehículos por visita.
 * @class UsoVehiculoVisitaController
 * @method create - Maneja la creación de un nuevo uso de vehículo por visita.
 * @method getAll - Maneja la obtención de todos los usos de vehículos por visita.
 * @method getOne - Maneja la obtención de un uso de vehículo por visita por su código.
 * @method update - Maneja la actualización de un uso de vehículo por visita existente.
 * @method remove - Maneja la eliminación de un uso de vehículo por visita por su código.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class UsoVehiculoVisitaController {
  async create(req: Request, res: Response) {
    const nuevoUso = await usoService.create(req.body)
    res.status(201).json(nuevoUso)
  }

  async getAll(req: Request, res: Response) {
    const usos = await usoService.findAll()
    res.status(200).json(usos)
  }

  async getOne(req: Request, res: Response) {
    const cod_visita = parseInt(req.params.cod_visita, 10)
    const patente = req.params.patente
    const uso = await usoService.findById(cod_visita, patente)
    if (!uso) {
      return res
        .status(404)
        .json({ message: 'Uso de vehículo por visita no encontrado' })
    }
    res.json(uso)
  }

  async update(req: Request, res: Response) {
    const cod_visita = parseInt(req.params.cod_visita, 10)
    const patente = req.params.patente
    const uso = await usoService.update(cod_visita, patente, req.body)
    res.json(uso)
  }

  async remove(req: Request, res: Response) {
    const cod_visita = parseInt(req.params.cod_visita, 10)
    const patente = req.params.patente
    const uso = await usoService.remove(cod_visita, patente)
    res.json(uso)
  }
}
