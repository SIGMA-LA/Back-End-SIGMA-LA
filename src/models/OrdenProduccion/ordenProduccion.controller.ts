import { Request, Response } from 'express'
import { OrdenProduccionService } from './ordenProduccion.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

const ordenProduccionService = new OrdenProduccionService()

/**
 * Controller to handle production order (orden de producción) routes.
 */
export class OrdenProduccionController {
  /**
   * Creates a new production order.
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const nueva = await ordenProduccionService.create(req.body)
    return sendSuccess(res, nueva, 'Production order created successfully', 201)
  })

  /**
   * Gets all production orders with optional filters.
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { cod_obra, estado } = req.query
    const ordenes = await ordenProduccionService.findAll({
      cod_obra: cod_obra ? Number(cod_obra) : undefined,
      estado: estado as string | undefined,
    })
    return sendSuccess(res, ordenes)
  })

  /**
   * Gets a specific production order by ID.
   */
  getOne = catchAsync(async (req: Request, res: Response) => {
    const { cod_op } = req.params
    const codOpNum = Number(cod_op)
    if (isNaN(codOpNum)) throw new AppError('Código de orden inválido', 400, 'INVALID_ID')

    const orden = await ordenProduccionService.findById(codOpNum)
    return sendSuccess(res, orden)
  })

  /**
   * Gets all validated production orders.
   */
  getValidadas = catchAsync(async (req: Request, res: Response) => {
    const ordenes = await ordenProduccionService.findValidadas()
    return sendSuccess(res, ordenes)
  })

  /**
   * Gets all production orders currently in production.
   */
  getEnProduccion = catchAsync(async (req: Request, res: Response) => {
    const ordenes = await ordenProduccionService.findEnProduccion()
    return sendSuccess(res, ordenes)
  })

  /**
   * Updates an existing production order.
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { cod_op } = req.params
    const codOpNum = Number(cod_op)
    if (isNaN(codOpNum)) throw new AppError('Código de orden inválido', 400, 'INVALID_ID')

    const orden = await ordenProduccionService.update(codOpNum, req.body)
    return sendSuccess(res, orden, 'Production order updated successfully')
  })

  /**
   * Removes a production order by its ID.
   */
  remove = catchAsync(async (req: Request, res: Response) => {
    const { cod_op } = req.params
    const codOpNum = Number(cod_op)
    if (isNaN(codOpNum)) throw new AppError('Código de orden inválido', 400, 'INVALID_ID')

    await ordenProduccionService.remove(codOpNum)
    return res.status(204).send()
  })

  /**
   * Gets production orders associated with a specific obra.
   */
  getByObra = catchAsync(async (req: Request, res: Response) => {
    const { cod_obra } = req.params
    const codObraNum = Number(cod_obra)
    if (isNaN(codObraNum)) throw new AppError('Código de obra inválido', 400, 'INVALID_ID')

    const ordenes = await ordenProduccionService.findByObra(codObraNum)
    return sendSuccess(res, ordenes)
  })

  /**
   * Gets finished production orders associated with a specific obra.
   */
  getByObraAndFinalizada = catchAsync(async (req: Request, res: Response) => {
    const { cod_obra } = req.params
    const codObraNum = Number(cod_obra)
    if (isNaN(codObraNum)) throw new AppError('Código de obra inválido', 400, 'INVALID_ID')

    const ordenes = await ordenProduccionService.findByObraAndFinalizada(codObraNum)
    return sendSuccess(res, ordenes)
  })

  /**
   * Marks a production order as starting production.
   */
  iniciarProduccion = catchAsync(async (req: Request, res: Response) => {
    const { cod_op } = req.params
    const codOpNum = Number(cod_op)
    if (isNaN(codOpNum)) throw new AppError('Código de orden inválido', 400, 'INVALID_ID')

    const orden = await ordenProduccionService.iniciarProduccion(codOpNum)
    return sendSuccess(res, orden, 'Production started for this order')
  })

  /**
   * Marks a production order as finished.
   */
  finalizarProduccion = catchAsync(async (req: Request, res: Response) => {
    const { cod_op } = req.params
    const codOpNum = Number(cod_op)
    if (isNaN(codOpNum)) throw new AppError('Código de orden inválido', 400, 'INVALID_ID')

    const orden = await ordenProduccionService.finalizarProduccion(codOpNum)
    return sendSuccess(res, orden, 'Production order finalized successfully')
  })

}
