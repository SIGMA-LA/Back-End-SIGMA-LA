import { Request, Response } from 'express'
import { EntregaService } from './entrega.service.js'

const entregaService = new EntregaService()

/**
 * Controlador para manejar las rutas de entregas.
 * @class EntregaController
 */
export class EntregaController {
  async create(req: Request, res: Response) {
    try {
      const entrega = await entregaService.create(req.body)
      res.status(201).json(entrega)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      const status = (error as { status?: number }).status || 400
      res.status(status).json({ message })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const search = req.query.q as string | undefined
      const estado = req.query.estado as string | undefined
      const entregas = await entregaService.findAll(search, estado)
      res.json(entregas)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al obtener entregas'
      res.status(500).json({ message })
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const cod_entrega = parseInt(req.params.id)
      const entrega = await entregaService.findById(cod_entrega)
      if (!entrega) {
        return res.status(404).json({ message: 'Entrega no encontrada' })
      }
      res.json(entrega)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al obtener la entrega'
      res.status(500).json({ message })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const cod_entrega = parseInt(req.params.id)
      const entrega = await entregaService.update(cod_entrega, req.body)
      res.json(entrega)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al actualizar entrega'
      const status = (error as { status?: number }).status || 400
      res.status(status).json({ message })
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const cod_entrega = parseInt(req.params.id)
      const entrega = await entregaService.delete(cod_entrega)
      res.json(entrega)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar entrega'
      res.status(400).json({ message })
    }
  }

  async getEntregasByEmpleadoEstado(req: Request, res: Response) {
    try {
      const { cuil_empleado, estado } = req.params
      const { search, date } = req.query as { search?: string; date?: string }
      const entregas = await entregaService.getByEmpleadoEstado(
        cuil_empleado,
        estado,
        search,
        date,
      )
      res.json(entregas)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al obtener entregas por empleado'
      res.status(500).json({ message })
    }
  }

  async finalizarEntrega(req: Request, res: Response) {
    try {
      const cod_entrega = parseInt(req.params.id)
      const { observaciones } = req.body
      const entrega = await entregaService.finalizar(cod_entrega, observaciones)
      res.json(entrega)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al finalizar la entrega'
      res.status(400).json({ message })
    }
  }

  async cancelarEntrega(req: Request, res: Response) {
    try {
      const cod_entrega = parseInt(req.params.id)
      const { motivo } = req.body
      const entrega = await entregaService.cancelar(cod_entrega, motivo)
      res.json(entrega)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al cancelar la entrega'
      res.status(400).json({ message })
    }
  }

  async agregarOPs(req: Request, res: Response) {
    try {
      const cod_entrega = parseInt(req.params.id)
      const { cod_ops } = req.body as { cod_ops: number[] }
      const entrega = await entregaService.agregarOrdenesDeProduccion(
        cod_entrega,
        cod_ops,
      )
      res.json(entrega)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al agregar órdenes de producción'
      res.status(400).json({ message })
    }
  }

  async quitarOPs(req: Request, res: Response) {
    try {
      const cod_entrega = parseInt(req.params.id)
      const { cod_ops } = req.body as { cod_ops: number[] }
      const entrega = await entregaService.quitarOrdenesDeProduccion(
        cod_entrega,
        cod_ops,
      )
      res.json(entrega)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al quitar órdenes de producción'
      res.status(400).json({ message })
    }
  }
}
