import { Request, Response } from 'express'
import { EmpleadoService } from './empleado.service.js'

const empleadoService = new EmpleadoService()

/**
 * Controlador para manejar las rutas de empleados.
 * @class EmpleadoController
 * @method create - Maneja la creación de un nuevo empleado.
 * @method getAll - Maneja la obtención de todos los empleados.
 * @method getOne - Maneja la obtención de un empleado por su CUIL.
 * @method update - Maneja la actualización de un empleado existente.
 * @method remove - Maneja la eliminación de un empleado por su CUIL.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */

export class EmpleadoController {
  async create(req: Request, res: Response) {
    const empleado = await empleadoService.create(req.body)
    res.status(201).json(empleado)
  }

  async getAll(req: Request, res: Response) {
    const empleados = await empleadoService.findAll()
    res.json(empleados)
  }

  async getOne(req: Request, res: Response) {
    const cuil = req.params.cuil
    const empleado = await empleadoService.findByCuil(cuil)
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' })
    }
    res.json(empleado)
  }

  async getDisponiblesParaEntrega(req: Request, res: Response) {
    const empleados = await empleadoService.findDisponiblesParaEntrega()
    res.json(empleados)
  }

  async update(req: Request, res: Response) {
    const cuil = req.params.cuil
    const empleado = await empleadoService.update(cuil, req.body)
    res.json(empleado)
  }

  async remove(req: Request, res: Response) {
    const cuil = req.params.cuil
    const empleado = await empleadoService.remove(cuil)
    res.json(empleado)
  }
}
