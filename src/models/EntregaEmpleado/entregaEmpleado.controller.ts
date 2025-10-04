import { EntregaEmpleadoService } from './entregaEmpleado.service.js'
import { Request, Response } from 'express'

const entregaEmpleadoService = new EntregaEmpleadoService()

export class EntregaEmpleadoController {
  async create(req: Request, res: Response) {
    try {
      const nuevaRelacion = await entregaEmpleadoService.create(req.body)
      res.status(201).json(nuevaRelacion)
    } catch (error) {
      res.status(400).json({
        message: 'Error al crear relación entrega-empleado',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const relaciones = await entregaEmpleadoService.findAll()
      res.status(200).json(relaciones)
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener relaciones entrega-empleado',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const cod_entrega = Number(req.params.id)
      const cuil = req.params.cuil
      const relacion = await entregaEmpleadoService.findById(cod_entrega, cuil)

      if (!relacion) {
        return res.status(404).json({
          message: 'Relación entrega-empleado no encontrada',
        })
      }

      res.json(relacion)
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener relación entrega-empleado',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const cod_entrega = Number(req.params.id)
      const cuil = req.params.cuil
      const relacion = await entregaEmpleadoService.update(
        cod_entrega,
        cuil,
        req.body,
      )
      res.json(relacion)
    } catch (error) {
      res.status(400).json({
        message: 'Error al actualizar relación entrega-empleado',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const cod_entrega = Number(req.params.id)
      const cuil = req.params.cuil
      const relacion = await entregaEmpleadoService.delete(cod_entrega, cuil)
      res.json(relacion)
    } catch (error) {
      res.status(400).json({
        message: 'Error al eliminar relación entrega-empleado',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }
}
