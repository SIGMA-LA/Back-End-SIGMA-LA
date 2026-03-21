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

  async getDisponibles(req: Request, res: Response) {
    const vehiculos = await vehiculoService.findDisponibles()
    res.json(vehiculos)
  }

  async getDisponibilidadPorFecha(req: Request, res: Response) {
    try {
      const { fecha_hora_inicio, fecha_hora_fin } = req.query

      if (
        !fecha_hora_inicio ||
        !fecha_hora_fin ||
        typeof fecha_hora_inicio !== 'string' ||
        typeof fecha_hora_fin !== 'string'
      ) {
        return res.status(400).json({
          error:
            'Debe proporcionar fecha_hora_inicio y fecha_hora_fin como strings ISO.',
        })
      }

      const fechaInicio = new Date(fecha_hora_inicio)
      const fechaFin = new Date(fecha_hora_fin)

      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        return res
          .status(400)
          .json({ error: 'Las fechas proporcionadas no son válidas.' })
      }

      const vehiculos = await vehiculoService.findDisponibilidadPorFecha(
        fechaInicio,
        fechaFin,
      )
      res.json(vehiculos)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(500).json({ error: message, code: 'FETCH_AVAILABILITY_ERROR' })
    }
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
