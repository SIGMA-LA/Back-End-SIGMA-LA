import { ParametroService } from './parametro.service.js'
import { Request, Response } from 'express'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

const parametroService = new ParametroService()

/**
 * Controller to handle system parameter (parametro) routes.
 */
export class ParametroController {
  /**
   * Creates a new parameter record.
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const parametro = await parametroService.create(req.body)
    return sendSuccess(res, parametro, 'Parameter created successfully', 201)
  })

  /**
   * Gets all parameter records.
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const parameters = await parametroService.findAll()
    return sendSuccess(res, parameters)
  })

  /**
   * Gets a specific parameter by ID.
   */
  getOne = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const idNum = Number(id)
    if (isNaN(idNum)) throw new AppError('ID de parámetro inválido', 400, 'INVALID_ID')

    const parameter = await parametroService.findById(idNum)
    return sendSuccess(res, parameter)
  })

  /**
   * Gets the current parameter record (all parameters).
   */
  getActual = catchAsync(async (req: Request, res: Response) => {
    const parametro = await parametroService.findLatest()
    return sendSuccess(res, parametro)
  })

  /**
   * Gets the current travel allowance (viatico) configuration.
   */
  getActualViatico = catchAsync(async (req: Request, res: Response) => {
    const viatico = await parametroService.findActualViatico()
    return sendSuccess(res, viatico)
  })

  /**
   * Gets the travel allowance (viatico) for a specific date.
   */
  getViaticoByDate = catchAsync(async (req: Request, res: Response) => {
    const { fecha } = req.query
    if (!fecha || typeof fecha !== 'string') {
      throw new AppError('Fecha es requerida', 400, 'FECHA_REQUIRED')
    }
    const date = new Date(fecha)
    if (isNaN(date.getTime())) {
      throw new AppError('Fecha inválida', 400, 'INVALID_DATE')
    }

    const viatico = await parametroService.findViaticoByDate(date)
    return sendSuccess(res, viatico)
  })

  /**
   * Updates an existing parameter record.
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const idNum = Number(id)
    if (isNaN(idNum)) throw new AppError('ID de parámetro inválido', 400, 'INVALID_ID')

    const parameter = await parametroService.update(idNum, req.body)
    return sendSuccess(res, parameter, 'Parameter updated successfully')
  })

  /**
   * Removes a parameter record.
   */
  remove = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const idNum = Number(id)
    if (isNaN(idNum)) throw new AppError('ID de parámetro inválido', 400, 'INVALID_ID')

    await parametroService.remove(idNum)
    return res.status(204).send()
  })
}

export const parametroController = new ParametroController()

