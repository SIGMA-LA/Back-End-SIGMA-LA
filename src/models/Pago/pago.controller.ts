import { PagoService } from './pago.service.js'
import { Request, Response } from 'express'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'
import { ValidationError } from '../../shared/errors/validationError.js'

const pagoService = new PagoService()

/**
 * Controller to handle payment (pago) routes.
 */
export class PagoController {
  /**
   * Creates a new payment for a specific construction project (obra).
   */
  createForObra = catchAsync(async (req: Request, res: Response) => {
    const codObra = parseInt(req.params.cod_obra, 10)
    if (isNaN(codObra)) throw new AppError('Invalid obra code', 400, 'INVALID_ID')

    const nuevoPago = await pagoService.createForObra(codObra, req.body)
    return sendSuccess(res, nuevoPago, 'Payment registered successfully', 201)
  })

  /**
   * Gets all payments with optional filtering.
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const filters = {
      search: req.query.search as string,
      cliente: req.query.cliente as string,
      fechaDesde: req.query.fechaDesde as string,
      fechaHasta: req.query.fechaHasta as string,
      obra: req.query.obra as string,
      montoMin: req.query.montoMin ? parseFloat(req.query.montoMin as string) : undefined,
      montoMax: req.query.montoMax ? parseFloat(req.query.montoMax as string) : undefined,
    }

    // Validation: Date range
    if (filters.fechaDesde && filters.fechaHasta) {
      const fechaDesde = new Date(filters.fechaDesde)
      const fechaHasta = new Date(filters.fechaHasta)
      if (fechaDesde > fechaHasta) {
        throw new ValidationError('Start date cannot be greater than end date', 'INVALID_DATE_RANGE')
      }
    }

    // Validation: Amount range
    if (filters.montoMin !== undefined && filters.montoMax !== undefined) {
      if (filters.montoMin > filters.montoMax) {
        throw new ValidationError('Minimum amount cannot be greater than maximum amount', 'INVALID_AMOUNT_RANGE')
      }
    }

    // Sanitization and cleanup
    const cleanFilters: Record<string, string | number | boolean> = {}
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && !(typeof value === 'number' && isNaN(value))) {
        cleanFilters[key] = typeof value === 'string' ? value.replace(/[<>{}]/g, '') : value
      }
    })

    const pagos = await pagoService.findAll(Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined)
    return sendSuccess(res, pagos)
  })

  /**
   * Creates a basic payment entry.
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const nuevo = await pagoService.createOne(req.body)
    return sendSuccess(res, nuevo, 'Payment created successfully', 201)
  })

  /**
   * Gets a specific payment by ID.
   */
  getOne = catchAsync(async (req: Request, res: Response) => {
    const codPago = parseInt(req.params.id, 10)
    if (isNaN(codPago)) throw new AppError('Invalid payment code', 400, 'INVALID_ID')

    const pago = await pagoService.findById(codPago)
    return sendSuccess(res, pago)
  })

  /**
   * Updates an existing payment.
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const codPago = parseInt(req.params.id, 10)
    if (isNaN(codPago)) throw new AppError('Invalid payment code', 400, 'INVALID_ID')

    const pago = await pagoService.update(codPago, req.body)
    return sendSuccess(res, pago, 'Payment updated successfully')
  })

  /**
   * Removes a payment by its ID.
   */
  remove = catchAsync(async (req: Request, res: Response) => {
    const codPago = parseInt(req.params.id, 10)
    if (isNaN(codPago)) throw new AppError('Invalid payment code', 400, 'INVALID_ID')

    await pagoService.remove(codPago)
    return res.status(204).send()
  })

  /**
   * Gets all payments associated with a specific construction project.
   */
  getByObra = catchAsync(async (req: Request, res: Response) => {
    const codObra = parseInt(req.params.cod_obra, 10)
    if (isNaN(codObra)) throw new AppError('Invalid obra code', 400, 'INVALID_ID')

    const pagos = await pagoService.findByObra(codObra)
    return sendSuccess(res, pagos)
  })
}

export const pagoController = new PagoController()

