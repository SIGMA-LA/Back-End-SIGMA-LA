import { Request, Response } from 'express'
import { visitaService } from './visita.service.js'

/**
 * Controlador para manejar las rutas de visitas.
 * @class VisitaController
 * @method create - Maneja la creación de una nueva visita.
 * @method getAll - Maneja la obtención de todas las visitas.
 * @method getOne - Maneja la obtención de una visita por su cod_visita.
 * @method update - Maneja la actualización de una visita existente.
 * @method remove - Maneja la eliminación de una visita por su cod_visita.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */

export class VisitaController {
  async create(req: Request, res: Response) {
    const visita = await visitaService.create(req.body)
    res.status(201).json(visita)
  }

  async getAll(req: Request, res: Response) {
    const visitas = await visitaService.findAll()
    res.json(visitas)
  }

  async getOne(req: Request, res: Response) {
    const { id } = req.params
    const visita = await visitaService.findById(Number(id))
    if (!visita) {
      return res.status(404).json({ message: 'Visita no encontrada' })
    }
    res.json(visita)
  }

  async buscar(req: Request, res: Response) {
    try {
      const q = String(req.query.q ?? '').trim()
      const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10))
      const pageSize = Math.max(
        1,
        Math.min(100, parseInt(String(req.query.pageSize ?? '25'), 10)),
      )

      if (!q) {
        return res.status(400).json({ message: 'Parametro "q" es requerido' })
      }

      const visitas = await visitaService.buscar(q, page, pageSize)
      return res.status(200).json(visitas)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      return res.status(500).json({ error: message })
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params
    const visita = await visitaService.update(Number(id), req.body)
    res.json(visita)
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params
    const visita = await visitaService.remove(Number(id))
    res.json(visita)
  }

  async getVisitasByEmpleadoAndEstado(req: Request, res: Response) {
    try {
      const cuil = req.params.cuil
      const estado = req.params.estado as
        | 'PROGRAMADA'
        | 'EN CURSO'
        | 'CANCELADA'
        | 'REPROGRAMADA'
        | 'COMPLETADA'

      const visitas = await visitaService.getVisitasByEmpleadoAndEstado(
        cuil,
        estado,
      )
      res.status(200).json(visitas)
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener visitas por empleado y estado',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  // Obtener todas las visitas de un empleado (con filtros opcionales)
  async getVisitasByEmpleado(req: Request, res: Response) {
    try {
      const cuil = req.params.cuil
      const estado = req.query.estado as string[] | string | undefined
      const search = req.query.search as string | undefined
      const date = req.query.date as string | undefined

      const estadosArray = estado
        ? Array.isArray(estado)
          ? estado
          : [estado]
        : undefined

      const visitas = await visitaService.getVisitasByEmpleado(
        cuil,
        estadosArray,
        search,
        date,
      )
      res.status(200).json(visitas)
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener visitas del empleado',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  // Obtener visitas por obra
  async getVisitasByObra(req: Request, res: Response) {
    try {
      const cod_obra = Number(req.params.cod_obra)
      const visitas = await visitaService.getVisitasByObra(cod_obra)
      res.status(200).json(visitas)
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener visitas de la obra',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async finalizarVisita(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { observaciones } = req.body
      const visita = await visitaService.finalizar(Number(id), observaciones)
      res.json(visita)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(404).json({ error: message })
    }
  }

  async cancelarVisita(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { motivo } = req.body
      const visita = await visitaService.cancelar(Number(id), motivo)
      res.json(visita)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(404).json({ error: message })
    }
  }
}

export const visitaController = new VisitaController()
