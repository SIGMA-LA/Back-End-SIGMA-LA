import { Request, Response } from 'express'
import { EntregaService } from './entrega.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

const entregaService = new EntregaService()

/**
 * Controlador para manejar las rutas de entregas.
 */
export class EntregaController {
  create = catchAsync(async (req: Request, res: Response) => {
    const entrega = await entregaService.create(req.body)
    return sendSuccess(res, entrega, 'Entrega creada exitosamente', 201)
  })

  getAll = catchAsync(async (req: Request, res: Response) => {
    const search = req.query.q as string | undefined
    const estado = req.query.estado as string | undefined
    const entregas = await entregaService.findAll(search, estado)
    return sendSuccess(res, entregas)
  })

  getOne = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = parseInt(req.params.id)
    if (isNaN(cod_entrega)) throw new AppError('ID de entrega inválido', 400, 'INVALID_ID')
    
    const entrega = await entregaService.findById(cod_entrega)
    if (!entrega) {
      throw new AppError('Entrega no encontrada', 404, 'ENTREGA_NOT_FOUND')
    }
    return sendSuccess(res, entrega)
  })

  update = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = parseInt(req.params.id)
    if (isNaN(cod_entrega)) throw new AppError('ID de entrega inválido', 400, 'INVALID_ID')
    
    const entrega = await entregaService.update(cod_entrega, req.body)
    return sendSuccess(res, entrega, 'Entrega actualizada exitosamente')
  })

  remove = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = parseInt(req.params.id)
    if (isNaN(cod_entrega)) throw new AppError('ID de entrega inválido', 400, 'INVALID_ID')
    
    await entregaService.delete(cod_entrega)
    return res.status(204).send()
  })

  getEntregasByEmpleadoEstado = catchAsync(async (req: Request, res: Response) => {
    const { cuil_empleado, estado } = req.params
    const { search, date } = req.query as { search?: string; date?: string }
    const entregas = await entregaService.getByEmpleadoEstado(
      cuil_empleado,
      estado,
      search,
      date,
    )
    return sendSuccess(res, entregas)
  })

  finalizarEntrega = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = parseInt(req.params.id)
    if (isNaN(cod_entrega)) throw new AppError('ID de entrega inválido', 400, 'INVALID_ID')
    
    const { observaciones } = req.body
    const entrega = await entregaService.finalizar(cod_entrega, observaciones)
    return sendSuccess(res, entrega, 'Entrega finalizada exitosamente')
  })

  cancelarEntrega = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = parseInt(req.params.id)
    if (isNaN(cod_entrega)) throw new AppError('ID de entrega inválido', 400, 'INVALID_ID')
    
    const { motivo } = req.body
    const entrega = await entregaService.cancelar(cod_entrega, motivo)
    return sendSuccess(res, entrega, 'Entrega cancelada exitosamente')
  })

  agregarOPs = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = parseInt(req.params.id)
    if (isNaN(cod_entrega)) throw new AppError('ID de entrega inválido', 400, 'INVALID_ID')
    
    const { cod_ops } = req.body as { cod_ops: number[] }
    const entrega = await entregaService.agregarOrdenesDeProduccion(
      cod_entrega,
      cod_ops,
    )
    return sendSuccess(res, entrega, 'Órdenes de producción agregadas exitosamente')
  })

  quitarOPs = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = parseInt(req.params.id)
    if (isNaN(cod_entrega)) throw new AppError('ID de entrega inválido', 400, 'INVALID_ID')
    
    const { cod_ops } = req.body as { cod_ops: number[] }
    const entrega = await entregaService.quitarOrdenesDeProduccion(
      cod_entrega,
      cod_ops,
    )
    return sendSuccess(res, entrega, 'Órdenes de producción quitadas exitosamente')
  })

  // ----------- STATS -----------
  getProgresoDiario = catchAsync(async (req: Request, res: Response) => {
    const stats = await entregaService.getProgresoDiario()
    return sendSuccess(res, stats)
  })
}

