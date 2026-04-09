import { ObraService } from './obra.service.js'
import { Request, Response } from 'express'
import type { NotasFabricaFilters } from './obra.repository.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess, sendPaginatedSuccess } from '../../shared/utils/apiResponse.js'
import { parsePagination } from '../../shared/utils/parsePagination.js'
import { AppError } from '../../shared/errors/AppError.js'

const obraService = new ObraService()
type NotasFabricaEstado = NotasFabricaFilters['estado']
const NOTAS_FABRICA_ESTADOS = [
  'SIN_ORDEN',
  'EN_PRODUCCION',
  'FINALIZADA',
] as const

/**
 * Controller to handle obra (construction project) routes.
 */
export class ObraController {
  // ----------- FILTERS AND SEARCHES -----------

  /**
   * Filters obras by status, location, or both.
   */
  filtrar = catchAsync(async (req: Request, res: Response) => {
    const { estado, localidad } = req.query
    const pagination = parsePagination(req.query as Record<string, unknown>)
    const result = await obraService.filtrar({
      estado: estado as string | undefined,
      cod_localidad: localidad ? Number(localidad) : undefined,
    }, pagination)
    return sendPaginatedSuccess(res, result)
  })

  /**
   * Searches obras by text (address, client, etc.).
   */
  buscar = catchAsync(async (req: Request, res: Response) => {
    const q = req.query.q as string
    const pagination = parsePagination(req.query as Record<string, unknown>)
    const result = await obraService.buscar(q, pagination)
    return sendPaginatedSuccess(res, result)
  })

  /**
   * Gets obras eligible for delivery creation based on whether it is partial or final.
   */
  getObrasParaEntrega = catchAsync(async (req: Request, res: Response) => {
    const q = req.query.q as string | undefined
    const esFinalStr = req.query.esFinal as string
    const esFinal = esFinalStr === 'true'

    const obras = await obraService.findObrasParaEntrega(q, esFinal)
    return sendSuccess(res, obras)
  })

  /**
   * Gets obras for a specific client.
   */
  getByCliente = catchAsync(async (req: Request, res: Response) => {
    const cuil = req.params.cuil
    const obras = await obraService.findByCliente(cuil)
    return sendSuccess(res, obras)
  })

  /**
   * Gets all obras.
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const pagination = parsePagination(req.query as Record<string, unknown>)
    const result = await obraService.findAll(pagination)
    return sendPaginatedSuccess(res, result)
  })

  /**
   * Gets an obra by ID.
   */
  getOne = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) throw new AppError('ID de obra inválido', 400, 'INVALID_ID')
    
    const obra = await obraService.findById(id)
    return sendSuccess(res, obra)
  })

  // ----------- FACTORY NOTE (NOTAS DE FÁBRICA) -----------

  /**
   * Gets obras for factory notes based on frontend filters.
   */
  getNotasFabrica = catchAsync(async (req: Request, res: Response) => {
    const { estado, fechaDesde, fechaHasta } = req.query as {
      estado?: string
      fechaDesde?: string
      fechaHasta?: string
    }

    const allowedQueryParams = new Set(['estado', 'fechaDesde', 'fechaHasta'])
    const invalidQueryParams = Object.keys(req.query).filter(
      key => !allowedQueryParams.has(key),
    )

    if (invalidQueryParams.length > 0) {
      throw new AppError(
        'Parámetros de consulta no válidos. Solo se permiten estado, fechaDesde y fechaHasta.',
        400,
        'INVALID_QUERY_PARAMS'
      )
    }

    const normalizeQueryValue = (value?: string) => {
      if (!value) return undefined
      const normalized = value.trim()
      if (!normalized) return undefined
      if (normalized === 'undefined' || normalized === 'null') return undefined
      return normalized
    }

    const normalizedEstado = normalizeQueryValue(estado)
    const normalizedFechaDesde = normalizeQueryValue(fechaDesde)
    const normalizedFechaHasta = normalizeQueryValue(fechaHasta)

    if (!normalizedEstado) {
      throw new AppError('El parámetro "estado" es requerido en la consulta', 400, 'QUERY_PARAM_REQUIRED')
    }

    if (
      !NOTAS_FABRICA_ESTADOS.includes(normalizedEstado as NotasFabricaEstado)
    ) {
      throw new AppError('El estado debe ser SIN_ORDEN, EN_PRODUCCION o FINALIZADA', 400, 'INVALID_STATE')
    }

    const fechaDesdeDate = normalizedFechaDesde ? new Date(normalizedFechaDesde) : null
    const fechaHastaDate = normalizedFechaHasta ? new Date(normalizedFechaHasta) : null

    if (normalizedFechaDesde && Number.isNaN(fechaDesdeDate?.getTime())) {
      throw new AppError('fechaDesde inválida', 400, 'INVALID_DATE')
    }

    if (normalizedFechaHasta && Number.isNaN(fechaHastaDate?.getTime())) {
      throw new AppError('fechaHasta inválida', 400, 'INVALID_DATE')
    }

    if (
      fechaDesdeDate &&
      fechaHastaDate &&
      fechaDesdeDate.getTime() > fechaHastaDate.getTime()
    ) {
      throw new AppError('fechaDesde no puede ser posterior a fechaHasta', 400, 'INVALID_DATE_RANGE')
    }

    const obras = await obraService.findNotasFabrica({
      estado: normalizedEstado as NotasFabricaEstado,
      fechaDesde: normalizedFechaDesde,
      fechaHasta: normalizedFechaHasta,
    })

    return sendSuccess(res, obras)
  })

  /**
   * Uploads a factory note to an obra.
   */
  subirNotaFabrica = catchAsync(async (req: Request, res: Response) => {
    const codObra = Number.parseInt(req.params.cod_obra, 10)

    if (Number.isNaN(codObra)) {
      throw new AppError('Código de obra inválido', 400, 'INVALID_ID')
    }

    if (!req.file) {
      throw new AppError('No se ha subido ningún archivo', 400, 'FILE_REQUIRED')
    }

    const obra = await obraService.subirNotaFabrica(codObra, req.file)
    return sendSuccess(res, obra, 'Factory note uploaded successfully', 201)
  })

  /**
   * Deletes the factory note of an obra.
   */
  deleteNotaFabrica = catchAsync(async (req: Request, res: Response) => {
    const codObra = Number.parseInt(req.params.cod_obra, 10)

    if (Number.isNaN(codObra)) {
      throw new AppError('Código de obra inválido', 400, 'INVALID_ID')
    }

    const obra = await obraService.deleteNotaFabrica(codObra)
    return sendSuccess(res, obra, 'Factory note deleted successfully')
  })

  /**
   * Gets obras with factory notes and orders in process.
   */
  getNotasConOrdenEnProceso = catchAsync(async (req: Request, res: Response) => {
    const obras = await obraService.findNotasConOrdenEnProceso()
    return sendSuccess(res, obras)
  })

  // ----------- OBRA CRUD -----------

  /**
   * Creates a new construction project.
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const nueva = await obraService.create(req.body)
    return sendSuccess(res, nueva, 'Obra created successfully', 201)
  })

  /**
   * Updates an existing obra by ID.
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) throw new AppError('ID de obra inválido', 400, 'INVALID_ID')
    
    const obra = await obraService.update(id, req.body)
    return sendSuccess(res, obra, 'Obra updated successfully')
  })

  /**
   * Logical deletion of an obra (status changed to CANCELADA).
   */
  bajaLogica = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) throw new AppError('ID de obra inválido', 400, 'INVALID_ID')
    
    const obra = await obraService.bajaLogica(id)
    return sendSuccess(res, obra, 'Obra cancelled successfully')
  })

  /**
   * Deletes an obra by ID (physical deletion).
   */
  remove = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) throw new AppError('ID de obra inválido', 400, 'INVALID_ID')
    
    await obraService.remove(id)
    return res.status(204).send()
  })

  /**
   * Gets obras with factory note but without approved order.
   */
  getNotasSinOrdenAprobada = catchAsync(async (req: Request, res: Response) => {
    const obras = await obraService.findNotasSinOrdenAprobada()
    return sendSuccess(res, obras)
  })

  /**
   * Gets obras with accepted budgets.
   */
  getObrasConPresupuestoAceptado = catchAsync(async (req: Request, res: Response) => {
    let search = req.query.search as string

    if (search) {
      search = search.trim().replace(/[<>{}]/g, '')
      if (search.length > 100) {
        throw new AppError('El término de búsqueda es demasiado largo', 400, 'SEARCH_TOO_LONG')
      }
    }

    const obras = await obraService.findObrasConPresupuestoAceptado(search)
    return sendSuccess(res, obras)
  })

  /**
   * Gets obras for stock requesting.
   */
  getObrasParaPedidoStock = catchAsync(async (req: Request, res: Response) => {
    const obras = await obraService.findObrasParaPedidoStock()
    return sendSuccess(res, obras)
  })

  /**
   * Changes obra status to EN ESPERA DE STOCK.
   */
  solicitarStock = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) throw new AppError('ID de obra inválido', 400, 'INVALID_ID')
    
    const obra = await obraService.solicitarStock(id)
    return sendSuccess(res, obra, 'Stock requested successfully')
  })

  /**
   * Changes obra status to EN PRODUCCION.
   */
  recibirStock = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) throw new AppError('ID de obra inválido', 400, 'INVALID_ID')
    
    const obra = await obraService.recibirStock(id)
    return sendSuccess(res, obra, 'Stock received and obra now in production')
  })

  // ----------- STATS -----------
  getAdminStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await obraService.getAdminStats()
    return sendSuccess(res, stats)
  })

  getVentasStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await obraService.getVentasStats()
    return sendSuccess(res, stats)
  })

  getCoordinacionStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await obraService.getCoordinacionStats()
    return sendSuccess(res, stats)
  })

  /**
   * Changes obra status to PRODUCCION FINALIZADA.
   */
  finalizarProduccion = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) throw new AppError('ID de obra inválido', 400, 'INVALID_ID')

    const obra = await obraService.finalizarProduccion(id)
    return sendSuccess(res, obra, 'Obra production finalized successfully')
  })
}
