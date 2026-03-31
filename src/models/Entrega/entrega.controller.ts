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
 * @method agregarOPs - Vincula órdenes de producción a una entrega.
 * @method quitarOPs - Desvincula órdenes de producción de una entrega.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */

export class EntregaController {
  async create(req: Request, res: Response) {
    try {
      const entrega = await entregaService.create(req.body)
      res.status(201).json(entrega)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('Conflicto de horario')) {
          return res.status(409).json({ message: error.message })
        }
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  async getAll(req: Request, res: Response) {
    const search = req.query.q as string | undefined
    const estado = req.query.estado as string | undefined
    const entregas = await entregaService.findAll(search, estado)
    res.json(entregas)
  }

  async getOne(req: Request, res: Response) {
    const cod_entrega = parseInt(req.params.id)
    const entrega = await entregaService.findById(cod_entrega)
    if (!entrega) {
      return res.status(404).json({ message: 'Entrega no encontrada' })
    }
    res.json(entrega)
  }

  async update(req: Request, res: Response) {
    const cod_entrega = parseInt(req.params.id)
    const entrega = await entregaService.update(cod_entrega, req.body)
    res.json(entrega)
  }

  async remove(req: Request, res: Response) {
    const cod_entrega = parseInt(req.params.id)
    const entrega = await entregaService.delete(cod_entrega)
    res.json(entrega)
  }

  async getEntregasByEmpleadoEstado(req: Request, res: Response) {
    const { cuil_empleado, estado } = req.params
    const { search, date } = req.query as { search?: string; date?: string }
    const entregas = await entregaService.getByEmpleadoEstado(
      cuil_empleado,
      estado,
      search,
      date,
    )
    res.json(entregas)
  }

  async finalizarEntrega(req: Request, res: Response) {
    try {
      const cod_entrega = parseInt(req.params.id)
      const { observaciones } = req.body
      const entrega = await entregaService.finalizar(cod_entrega, observaciones)
      res.json(entrega)
    } catch (error) {
      console.error('Error al finalizar entrega:', error)
      const message =
        error instanceof Error ? error.message : 'Error al finalizar la entrega'
      res.status(400).json({ message })
    }
  }

  async cancelarEntrega(req: Request, res: Response) {
    try {
      const cod_entrega = parseInt(req.params.id)
      const { motivo } = req.body
      const entrega = await entregaService.cancelar(cod_entrega, motivo)
      res.json(entrega)
    } catch (error) {
      console.error('Error al cancelar entrega:', error)
      const message =
        error instanceof Error ? error.message : 'Error al cancelar la entrega'
      res.status(400).json({ message })
    }
  }

  /** PATCH /:id/ordenes-produccion — vincula OPs a una entrega */
  async agregarOPs(req: Request, res: Response) {
    try {
      const cod_entrega = parseInt(req.params.id)
      const { cod_ops } = req.body as { cod_ops: number[] }
      const entrega = await entregaService.agregarOrdenesDeProduccion(
        cod_entrega,
        cod_ops,
      )
      res.json(entrega)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al agregar órdenes de producción'
      res.status(400).json({ message })
    }
  }

  /** DELETE /:id/ordenes-produccion — desvincula OPs de una entrega */
  async quitarOPs(req: Request, res: Response) {
    try {
      const cod_entrega = parseInt(req.params.id)
      const { cod_ops } = req.body as { cod_ops: number[] }
      const entrega = await entregaService.quitarOrdenesDeProduccion(
        cod_entrega,
        cod_ops,
      )
      res.json(entrega)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al quitar órdenes de producción'
      res.status(400).json({ message })
    }
  }
}
