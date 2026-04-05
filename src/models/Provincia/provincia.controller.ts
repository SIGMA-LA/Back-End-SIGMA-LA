import { Request, Response } from 'express'
import { ProvinciaService } from './provincia.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

const provinciaService = new ProvinciaService()

/**
 * Controller to handle province (provincia) routes.
 */
export class ProvinciaController {
  /**
   * Creates a new province.
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const provincia = await provinciaService.create(req.body)
    return sendSuccess(res, provincia, 'Province created successfully', 201)
  })

  /**
   * Gets a specific province by ID.
   */
  getOne = catchAsync(async (req: Request, res: Response) => {
    const codProvincia = parseInt(req.params.id, 10)
    if (isNaN(codProvincia)) throw new AppError('Invalid province ID', 400, 'INVALID_ID')

    const provincia = await provinciaService.findById(codProvincia)
    return sendSuccess(res, provincia)
  })

  /**
   * Gets all province records.
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const provincias = await provinciaService.findAll()
    return sendSuccess(res, provincias)
  })
}

