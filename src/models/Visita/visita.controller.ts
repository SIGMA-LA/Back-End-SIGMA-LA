import { Request, Response } from 'express'
import { visitaService } from './visita.service.js'

/**
 * Controlador para manejar las rutas de visitas.
 * @class VisitaController
 */
export class VisitaController {
  async create(req: Request, res: Response) {
    try {
      const visita = await visitaService.create(req.body)
      res.status(201).json(visita)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      const status = (error as { status?: number }).status || 400
      res.status(status).json({ message })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const estado = req.query.estado as string | undefined
      const visitas = await visitaService.findAll(estado)
      res.json(visitas)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al obtener visitas'
      res.status(500).json({ message })
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params
      const visita = await visitaService.findById(Number(id))
      if (!visita) {
        return res.status(404).json({ message: 'Visita no encontrada' })
      }
      res.json(visita)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al obtener la visita'
      res.status(500).json({ message })
    }
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

      const estado = req.query.estado as string | undefined
      const visitas = await visitaService.buscar(q, page, pageSize, estado)
      return res.status(200).json(visitas)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      return res.status(500).json({ message })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const visita = await visitaService.update(Number(id), req.body)
      res.json(visita)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al actualizar visita'
      const status = (error as { status?: number }).status || 400
      res.status(status).json({ message })
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params
      const visita = await visitaService.remove(Number(id))
      res.json(visita)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar visita'
      res.status(400).json({ message })
    }
  }

  async getVisitasByEmpleadoAndEstado(req: Request, res: Response) {
    try {
      const cuil = req.params.cuil
      const estado = req.params.estado
      const visitas = await visitaService.getVisitasByEmpleadoAndEstado(
        cuil,
        estado,
      )
      res.status(200).json(visitas)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      res.status(500).json({ message })
    }
  }

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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      res.status(500).json({ message })
    }
  }

  async getVisitasByObra(req: Request, res: Response) {
    try {
      const cod_obra = Number(req.params.cod_obra)
      const visitas = await visitaService.getVisitasByObra(cod_obra)
      res.status(200).json(visitas)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      res.status(500).json({ message })
    }
  }

  async finalizarVisita(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { observaciones } = req.body
      const visita = await visitaService.finalizar(Number(id), observaciones)
      res.json(visita)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      res.status(400).json({ message })
    }
  }

  async cancelarVisita(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { motivo } = req.body
      const visita = await visitaService.cancelar(Number(id), motivo)
      res.json(visita)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      res.status(400).json({ message })
    }
  }
}

export const visitaController = new VisitaController()
