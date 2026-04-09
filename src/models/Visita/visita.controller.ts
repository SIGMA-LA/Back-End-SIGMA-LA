import { Request, Response } from 'express'
import { visitaService } from './visita.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess, sendPaginatedSuccess } from '../../shared/utils/apiResponse.js'
import { parsePagination } from '../../shared/utils/parsePagination.js'
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
    const pagination = parsePagination(req.query as Record<string, unknown>)
    const result = await visitaService.findAll(estado, pagination)
    return sendPaginatedSuccess(res, result)
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
    const pagination = parsePagination(req.query as Record<string, unknown>)

    if (!q) {
      throw new AppError('El parámetro de búsqueda "q" es requerido', 400, 'MISSING_PARAMS')
    }

    const estado = req.query.estado as string | undefined
    const result = await visitaService.buscar(q, pagination, estado)
    return sendPaginatedSuccess(res, result)
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
    const pagination = parsePagination(req.query as Record<string, unknown>)
    const visitas = await visitaService.getVisitasByEmpleadoAndEstado(
      cuil,
      estado,
      undefined,
      undefined,
      pagination
    )
    return sendPaginatedSuccess(res, visitas)
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
    const pagination = parsePagination(req.query as Record<string, unknown>)
    const visitas = await visitaService.getVisitasByEmpleado(
      cuil,
      estadosArray,
      search,
      date,
      pagination
    )
    return sendPaginatedSuccess(res, visitas)
  })

  /**
   * Gets all visits associated with an obra.
   */
  getVisitasByObra = catchAsync(async (req: Request, res: Response) => {
    const cod_obra = Number(req.params.cod_obra)
    if (isNaN(cod_obra)) throw new AppError('Código de obra inválido', 400, 'INVALID_ID')
    
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

  // ----------- STATS -----------
  getProgresoDiario = catchAsync(async (req: Request, res: Response) => {
    const stats = await visitaService.getProgresoDiario()
    return sendSuccess(res, stats)
  })
}

export const visitaController = new VisitaController()

