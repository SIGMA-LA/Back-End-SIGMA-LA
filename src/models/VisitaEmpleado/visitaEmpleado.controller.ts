import { VisitaEmpleadoService } from './visitaEmpleado.service.js'
import { Request, Response } from 'express'

const visitaEmpleadoService = new VisitaEmpleadoService()

export class VisitaEmpleadoController {
  async create(req: Request, res: Response) {
    try {
      const nuevaRelacion = await visitaEmpleadoService.create(req.body)
      res.status(201).json(nuevaRelacion)
    } catch (error) {
      res.status(400).json({
        message: 'Error al crear relación empleado-visita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const relaciones = await visitaEmpleadoService.findAll()
      res.status(200).json(relaciones)
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener relaciones empleado-visita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const cuil = req.params.cuil
      const cod_visita = Number(req.params.cod_visita)
      const relacion = await visitaEmpleadoService.findById(cuil, cod_visita)

      if (!relacion) {
        return res.status(404).json({
          message: 'Relación empleado-visita no encontrada',
        })
      }

      res.json(relacion)
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener relación empleado-visita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const cuil = req.params.cuil
      const cod_visita = Number(req.params.cod_visita)
      const relacion = await visitaEmpleadoService.update(
        cuil,
        cod_visita,
        req.body,
      )
      res.json(relacion)
    } catch (error) {
      res.status(400).json({
        message: 'Error al actualizar relación empleado-visita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const cuil = req.params.cuil
      const cod_visita = Number(req.params.cod_visita)
      const relacion = await visitaEmpleadoService.delete(cuil, cod_visita)
      res.json(relacion)
    } catch (error) {
      res.status(400).json({
        message: 'Error al eliminar relación empleado-visita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }
}
