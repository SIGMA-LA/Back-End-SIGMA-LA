import { PresupuestoService } from './presupuesto.service.js'
import { Request, Response } from 'express'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

const presupuestoService = new PresupuestoService()

/**
 * Controller to handle budget (presupuesto) routes.
 */
export class PresupuestoController {
  /**
   * Creates a new budget.
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const nueva = await presupuestoService.create(req.body)
    return sendSuccess(res, nueva, 'Budget created successfully', 201)
  })

  /**
   * Gets all budget records.
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const presupuestos = await presupuestoService.findAll()
    return sendSuccess(res, presupuestos)
  })

  /**
   * Gets a specific budget by its ID.
   */
  getOne = catchAsync(async (req: Request, res: Response) => {
    const { nro_presupuesto } = req.params
    const nroPrespuestoNum = Number(nro_presupuesto)
    if (isNaN(nroPrespuestoNum)) throw new AppError('Invalid budget number', 400, 'INVALID_ID')

    const presupuesto = await presupuestoService.findById(nroPrespuestoNum)
    return sendSuccess(res, presupuesto)
  })

  /**
   * Updates an existing budget record.
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { nro_presupuesto } = req.params
    const nroPrespuestoNum = Number(nro_presupuesto)
    if (isNaN(nroPrespuestoNum)) throw new AppError('Invalid budget number', 400, 'INVALID_ID')

    const presupuesto = await presupuestoService.update(nroPrespuestoNum, req.body)
    return sendSuccess(res, presupuesto, 'Budget updated successfully')
  })

  /**
   * Removes a budget record.
   */
  remove = catchAsync(async (req: Request, res: Response) => {
    const { nro_presupuesto } = req.params
    const nroPrespuestoNum = Number(nro_presupuesto)
    if (isNaN(nroPrespuestoNum)) throw new AppError('Invalid budget number', 400, 'INVALID_ID')

    await presupuestoService.remove(nroPrespuestoNum)
    return res.status(204).send()
  })
}

export const presupuestoController = new PresupuestoController()

