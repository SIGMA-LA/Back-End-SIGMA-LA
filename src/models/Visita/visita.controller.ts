import { Request, Response } from 'express'
import { visitaService } from './visita.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Controller to handle technical visit (visita) routes.
 */
export class VisitaController {
  /**
   * Creates a new technical visit.
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const visita = await visitaService.create(req.body)
    return sendSuccess(res, visita, 'Visit created successfully', 201)
  })

  /**
   * Gets all visits, optionally filtered by status.
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const estado = req.query.estado as string | undefined
    const visitas = await visitaService.findAll(estado)
    return sendSuccess(res, visitas)
  })

  /**
   * Gets a specific visit by ID.
   */
  getOne = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const visita = await visitaService.findById(Number(id))
    return sendSuccess(res, visita)
  })

  /**
   * Searches for visits with pagination and status filter.
   */
  buscar = catchAsync(async (req: Request, res: Response) => {
    const q = String(req.query.q ?? '').trim()
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10))
    const pageSize = Math.max(
      1,
      Math.min(100, parseInt(String(req.query.pageSize ?? '25'), 10)),
    )

    if (!q) {
      throw new AppError('Search parameter "q" is required', 400, 'MISSING_PARAMS')
    }

    const estado = req.query.estado as string | undefined
    const visitas = await visitaService.buscar(q, page, pageSize, estado)
    return sendSuccess(res, visitas)
  })

  /**
   * Updates an existing visit.
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const visita = await visitaService.update(Number(id), req.body)
    return sendSuccess(res, visita, 'Visit updated successfully')
  })

  /**
   * Removes a visit by its ID.
   */
  remove = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    await visitaService.remove(Number(id))
    return res.status(204).send()
  })

  /**
   * Gets visits for a specific employee and status.
   */
  getVisitasByEmpleadoAndEstado = catchAsync(async (req: Request, res: Response) => {
    const cuil = req.params.cuil
    const estado = req.params.estado
    const visitas = await visitaService.getVisitasByEmpleadoAndEstado(
      cuil,
      estado,
    )
    return sendSuccess(res, visitas)
  })

  /**
   * Gets all visits associated with an employee.
   */
  getVisitasByEmpleado = catchAsync(async (req: Request, res: Response) => {
    const cuil = req.params.cuil
    const estado = req.query.estado as string[] | string | undefined
    const search = req.query.search as string | undefined
    const date = req.query.date as string | undefined

    const estadosArray = estado
      ? Array.isArray(estado)
        ? estado
        : [estado]
      : undefined

    const visitas = await visitaService.getVisitasByEmpleado(
      cuil,
      estadosArray,
      search,
      date,
    )
    return sendSuccess(res, visitas)
  })

  /**
   * Gets all visits associated with an obra.
   */
  getVisitasByObra = catchAsync(async (req: Request, res: Response) => {
    const cod_obra = Number(req.params.cod_obra)
    if (isNaN(cod_obra)) throw new AppError('Invalid obra code', 400, 'INVALID_ID')
    
    const visitas = await visitaService.findByObra(cod_obra)
    return sendSuccess(res, visitas)
  })

  /**
   * Marks a visit as completed.
   */
  finalizarVisita = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const { observaciones } = req.body
    const visita = await visitaService.finalizar(Number(id), observaciones)
    return sendSuccess(res, visita, 'Visit finalized successfully')
  })

  /**
   * Marks a visit as cancelled.
   */
  cancelarVisita = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const { motivo } = req.body
    const visita = await visitaService.cancelar(Number(id), motivo)
    return sendSuccess(res, visita, 'Visit cancelled successfully')
  })
}

export const visitaController = new VisitaController()

