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
      const maquinas = await maquinariaService.findAll()
      res.json(maquinas)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(500).json({ error: message, code: 'FETCH_ERROR' })
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
