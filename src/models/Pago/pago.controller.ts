import { PagoService } from './pago.service.js'
import { Request, Response } from 'express'

const pagoService = new PagoService()

/**
 * Controlador para manejar las rutas de los pagos.
 * @class PagoController
 * @method create - Maneja la creación de un nuevo pago.
 * @method getAll - Maneja la obtención de todos los pagos.
 * @method getOne - Maneja la obtención de un pago por su código.
 * @method update - Maneja la actualización de un pago existente.
 * @method remove - Maneja la eliminación de un pago por su código.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class PagoController {
  async createForObra(req: Request, res: Response) {
    const nuevoPago = await pagoService.createForObra(
      parseInt(req.params.cod_obra, 10),
      req.body,
    )
    res.status(201).json(nuevoPago)
  }

  async getAll(req: Request, res: Response) {
    try {
      const filters = {
        search: req.query.search as string,
        cliente: req.query.cliente as string,
        fechaDesde: req.query.fechaDesde as string,
        fechaHasta: req.query.fechaHasta as string,
        obra: req.query.obra as string,
        montoMin: req.query.montoMin
          ? parseFloat(req.query.montoMin as string)
          : undefined,
        montoMax: req.query.montoMax
          ? parseFloat(req.query.montoMax as string)
          : undefined,
      }

      if (filters.fechaDesde && filters.fechaHasta) {
        const fechaDesde = new Date(filters.fechaDesde)
        const fechaHasta = new Date(filters.fechaHasta)
        if (fechaDesde > fechaHasta) {
          return res.status(400).json({
            message: 'La fecha desde no puede ser mayor que la fecha hasta',
          })
        }
      }

      if (filters.montoMin !== undefined && filters.montoMax !== undefined) {
        if (filters.montoMin > filters.montoMax) {
          return res.status(400).json({
            message: 'El monto mínimo no puede ser mayor que el monto máximo',
          })
        }
      }

      if (filters.cliente) {
        filters.cliente = filters.cliente.replace(/[<>{}]/g, '')
      }
      if (filters.obra) {
        filters.obra = filters.obra.replace(/[<>{}]/g, '')
      }
      if (filters.search) {
        filters.search = filters.search.replace(/[<>{}]/g, '')
      }

      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters]
        if (
          value === undefined ||
          value === '' ||
          (typeof value === 'number' && isNaN(value))
        ) {
          delete filters[key as keyof typeof filters]
        }
      })

      const pagos = await pagoService.findAll(
        Object.keys(filters).length > 0 ? filters : undefined,
      )
      res.status(200).json(pagos)
    } catch (error) {
      console.error('Error al obtener pagos:', error)
      res.status(500).json({
        message: 'Error interno del servidor al obtener pagos',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async create(req: Request, res: Response) {
    const nuevo = await pagoService.createOne(req.body)
    res.status(201).json(nuevo)
  }

  async getOne(req: Request, res: Response) {
    const cod_pago = parseInt(req.params.id, 10)
    const pago = await pagoService.findById(cod_pago)
    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' })
    }
    res.json(pago)
  }

  async update(req: Request, res: Response) {
    const cod_pago = parseInt(req.params.id, 10)
    const pago = await pagoService.update(cod_pago, req.body)
    res.json(pago)
  }

  async remove(req: Request, res: Response) {
    const cod_pago = parseInt(req.params.id, 10)
    const pago = await pagoService.remove(cod_pago)
    res.json(pago)
  }

  async getByObra(req: Request, res: Response) {
    const cod_obra = parseInt(req.params.cod_obra, 10)
    const pagos = await pagoService.findByObra(cod_obra)
    res.status(200).json(pagos)
  }
}
