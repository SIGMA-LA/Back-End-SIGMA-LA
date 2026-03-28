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
    try {
      const nueva = await maquinariaService.create(req.body)
      res.status(201).json(nueva)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(400).json({ error: message, code: 'CREATE_ERROR' })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { search, estado } = req.query
      const filters = {
        search: search as string | undefined,
        estado: estado as string | undefined,
      }
      const maquinas = await maquinariaService.findAll(filters)
      res.json(maquinas)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(500).json({ error: message, code: 'FETCH_ERROR' })
    }
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
        return res
          .status(400)
          .json({
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

      const maquinas = await maquinariaService.findDisponibilidadPorFecha(
        fechaInicio,
        fechaFin,
      )
      res.json(maquinas)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(500).json({ error: message, code: 'FETCH_AVAILABILITY_ERROR' })
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const cod_maquina = parseInt(req.params.id, 10)
      const maquina = await maquinariaService.findById(cod_maquina)
      if (!maquina) {
        return res
          .status(404)
          .json({ error: 'Maquinaria no encontrada', code: 'NOT_FOUND' })
      }
      res.json(maquina)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(500).json({ error: message, code: 'FETCH_ERROR' })
    }
  }

  async getDisponibles(req: Request, res: Response) {
    try {
      const maquinasDisponibles = await maquinariaService.findDisponibles()
      res.json(maquinasDisponibles)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(500).json({ error: message, code: 'FETCH_ERROR' })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const cod_maquina = parseInt(req.params.id, 10)
      const maquina = await maquinariaService.update(cod_maquina, req.body)
      res.json(maquina)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      if (message.includes('No existe una maquinaria')) {
        return res.status(404).json({ error: message, code: 'NOT_FOUND' })
      }
      res.status(400).json({ error: message, code: 'UPDATE_ERROR' })
    }
  }

  async updateEstado(req: Request, res: Response) {
    try {
      const cod_maquina = parseInt(req.params.id, 10)
      const { estado } = req.body
      const maquina = await maquinariaService.updateEstado(cod_maquina, estado)
      res.json(maquina)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      if (message.includes('No existe una maquinaria')) {
        return res.status(404).json({ error: message, code: 'NOT_FOUND' })
      }
      res.status(400).json({ error: message, code: 'UPDATE_ERROR' })
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const cod_maquina = parseInt(req.params.id, 10)
      await maquinariaService.remove(cod_maquina)
      res.status(204).send()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      if (message.includes('No existe una maquinaria')) {
        return res.status(404).json({ error: message, code: 'NOT_FOUND' })
      }
      res.status(500).json({ error: message, code: 'DELETE_ERROR' })
    }
  }
}
