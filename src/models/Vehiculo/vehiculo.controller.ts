import { Request, Response } from 'express'
import { vehiculoService } from './vehiculo.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Controlador para manejar las rutas de vehiculos.
 */
export class VehiculoController {
  create = catchAsync(async (req: Request, res: Response) => {
    const vehiculo = await vehiculoService.create(req.body)
    return sendSuccess(res, vehiculo, 'Vehiculo creado exitosamente', 201)
  })

  getAll = catchAsync(async (req: Request, res: Response) => {
    const { search, estado } = req.query
    const filters = {
      search: search as string | undefined,
      estado: estado as string | undefined,
    }
    const vehiculos = await vehiculoService.findAll(filters)
    return sendSuccess(res, vehiculos)
  })

  getDisponibles = catchAsync(async (req: Request, res: Response) => {
    const vehiculos = await vehiculoService.findDisponibles()
    return sendSuccess(res, vehiculos)
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

    const vehiculos = await vehiculoService.findDisponibilidadPorFecha(
      fechaInicio,
      fechaFin,
    )
    return sendSuccess(res, vehiculos)
  })

  getOne = catchAsync(async (req: Request, res: Response) => {
    const { patente } = req.params
    const vehiculo = await vehiculoService.findByPatente(patente)
    return sendSuccess(res, vehiculo)
  })

  update = catchAsync(async (req: Request, res: Response) => {
    const { patente } = req.params
    const vehiculo = await vehiculoService.update(patente, req.body)
    return sendSuccess(res, vehiculo, 'Vehiculo actualizado exitosamente')
  })

  remove = catchAsync(async (req: Request, res: Response) => {
    const { patente } = req.params
    await vehiculoService.remove(patente)
    return res.status(204).send()
  })
}

export const vehiculoController = new VehiculoController()

