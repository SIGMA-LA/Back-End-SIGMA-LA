import { UsoMaquinariaService } from './usoMaquinaria.service'
import { Request, Response } from 'express'

const usoService = new UsoMaquinariaService()

/**
 * Controlador para manejar las rutas de las maquinarias por uso.
 * @class UsoMaquinariaController
 * @method create - Maneja la creación de un nuevo uso de maquinaria.
 * @method getAll - Maneja la obtención de todos los usos de maquinaria.
 * @method getOne - Maneja la obtención de un uso de uso de maquinaria por su código.
 * @method update - Maneja la actualización de un uso de maquinaria existente.
 * @method remove - Maneja la eliminación de un uso de maquinaria por su código.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class UsoMaquinariaController {
  async create(req: Request, res: Response) {
    const nuevoUso = await usoService.create(req.body)
    res.status(201).json(nuevoUso)
  }

  async getAll(req: Request, res: Response) {
    const usos = await usoService.findAll()
    res.status(200).json(usos)
  }

  async getOne(req: Request, res: Response) {
    const { cod_maquina, cod_entrega } = req.params
    const uso = await usoService.findById(
      parseInt(cod_maquina, 10),
      parseInt(cod_entrega, 10),
    )
    if (!uso) {
      return res
        .status(404)
        .json({ message: 'Uso de vehículo por visita no encontrado' })
    }
    res.json(uso)
  }

  async update(req: Request, res: Response) {
    const { cod_maquina, cod_entrega } = req.params
    const uso = await usoService.update(
      parseInt(cod_maquina, 10),
      parseInt(cod_entrega, 10),
      req.body,
    )
    res.json(uso)
  }

  async remove(req: Request, res: Response) {
    const { cod_maquina, cod_entrega } = req.params
    const uso = await usoService.remove(
      parseInt(cod_maquina, 10),
      parseInt(cod_entrega, 10),
    )
    res.json(uso)
  }
}
