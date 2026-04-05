import { Request, Response } from 'express'
import { MaquinariaService } from './maquinaria.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

const maquinariaService = new MaquinariaService()

/**
 * Controlador para manejar las rutas de maquinaria.
 */
export class MaquinariaController {
  create = catchAsync(async (req: Request, res: Response) => {
    const nueva = await maquinariaService.create(req.body)
    return sendSuccess(res, nueva, 'Maquinaria creada exitosamente', 201)
  })

  getAll = catchAsync(async (req: Request, res: Response) => {
    const { search, estado } = req.query
    const filters = {
      search: search as string | undefined,
      estado: estado as string | undefined,
    }
    const maquinas = await maquinariaService.findAll(filters)
    return sendSuccess(res, maquinas)
  })

  getDisponibilidadPorFecha = catchAsync(async (req: Request, res: Response) => {
    const { fecha_hora_inicio, fecha_hora_fin } = req.query

    if (
      !fecha_hora_inicio ||
      !fecha_hora_fin ||
      typeof fecha_hora_inicio !== 'string' ||
      typeof fecha_hora_fin !== 'string'
    ) {
      throw new AppError(
        'Debe proporcionar fecha_hora_inicio y fecha_hora_fin como strings ISO.',
        400,
        'QUERY_PARAM_REQUIRED'
      )
    }

    const fechaInicio = new Date(fecha_hora_inicio)
    const fechaFin = new Date(fecha_hora_fin)

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      throw new AppError('Las fechas proporcionadas no son válidas.', 400, 'INVALID_DATE')
    }

    const maquinas = await maquinariaService.findDisponibilidadPorFecha(
      fechaInicio,
      fechaFin,
    )
    return sendSuccess(res, maquinas)
  })

  getOne = catchAsync(async (req: Request, res: Response) => {
    const cod_maquina = parseInt(req.params.id, 10)
    if (isNaN(cod_maquina)) throw new AppError('ID de maquinaria inválido', 400, 'INVALID_ID')
    
    const maquina = await maquinariaService.findById(cod_maquina)
    return sendSuccess(res, maquina)
  })

  getDisponibles = catchAsync(async (req: Request, res: Response) => {
    const maquinasDisponibles = await maquinariaService.findDisponibles()
    return sendSuccess(res, maquinasDisponibles)
  })

  update = catchAsync(async (req: Request, res: Response) => {
    const cod_maquina = parseInt(req.params.id, 10)
    if (isNaN(cod_maquina)) throw new AppError('ID de maquinaria inválido', 400, 'INVALID_ID')
    
    const maquina = await maquinariaService.update(cod_maquina, req.body)
    return sendSuccess(res, maquina, 'Maquinaria actualizada exitosamente')
  })

  updateEstado = catchAsync(async (req: Request, res: Response) => {
    const cod_maquina = parseInt(req.params.id, 10)
    if (isNaN(cod_maquina)) throw new AppError('ID de maquinaria inválido', 400, 'INVALID_ID')
    
    const { estado } = req.body
    const maquina = await maquinariaService.updateEstado(cod_maquina, estado)
    return sendSuccess(res, maquina, 'Estado de maquinaria actualizado exitosamente')
  })

  remove = catchAsync(async (req: Request, res: Response) => {
    const cod_maquina = parseInt(req.params.id, 10)
    if (isNaN(cod_maquina)) throw new AppError('ID de maquinaria inválido', 400, 'INVALID_ID')
    
    await maquinariaService.remove(cod_maquina)
    return res.status(204).send()
  })
}

