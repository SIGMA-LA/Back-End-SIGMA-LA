import { PresupuestoService } from './presupuesto.service.js'
import { Request, Response } from 'express'
import { env } from '../../config/env.js'

const presupuestoService = new PresupuestoService()

export class PresupuestoController {
  async create(req: Request, res: Response) {
    try {
      console.log('Creating presupuesto with body:', req.body)
      const nueva = await presupuestoService.create(req.body)
      res.status(201).json(nueva)
    } catch (error) {
      console.error('Error al crear presupuesto:', error)
      res.status(500).json({
        message: 'Error al crear presupuesto',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const presupuesto = await presupuestoService.findAll()
      res.status(200).json(presupuesto)
    } catch (error) {
      console.error('Error al obtener presupuestos:', error)
      res.status(500).json({
        message: 'Error al obtener presupuestos',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { nro_presupuesto } = req.params
      const presupuesto = await presupuestoService.findById(
        Number(nro_presupuesto),
      )
      if (!presupuesto) {
        return res.status(404).json({ message: 'Presupuesto no encontrado' })
      }
      res.json(presupuesto)
    } catch (error) {
      console.error('Error al obtener presupuesto:', error)
      res.status(500).json({
        message: 'Error al obtener presupuesto',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { nro_presupuesto } = req.params

      console.log('Updating presupuesto:', nro_presupuesto)
      console.log('Request body:', req.body)

      // Validar que el presupuesto existe
      const presupuestoExistente = await presupuestoService.findById(
        Number(nro_presupuesto),
      )

      if (!presupuestoExistente) {
        console.log('Presupuesto no encontrado:', nro_presupuesto)
        return res.status(404).json({ message: 'Presupuesto no encontrado' })
      }

      const presupuesto = await presupuestoService.update(
        Number(nro_presupuesto),
        req.body,
      )
      res.json(presupuesto)
    } catch (error) {
      console.error('Error completo al actualizar presupuesto:', error)

      // Enviar más detalles del error
      if (error instanceof Error) {
        res.status(400).json({
          message: 'Error al actualizar presupuesto',
          error: error.message,
          stack: env.NODE_ENV === 'development' ? error.stack : undefined,
        })
      } else {
        res.status(400).json({
          message: 'Error al actualizar presupuesto',
          error: 'Error desconocido',
        })
      }
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { nro_presupuesto } = req.params
      const presupuesto = await presupuestoService.remove(
        Number(nro_presupuesto),
      )
      res.json(presupuesto)
    } catch (error) {
      console.error('Error al eliminar presupuesto:', error)
      res.status(500).json({
        message: 'Error al eliminar presupuesto',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }
}
