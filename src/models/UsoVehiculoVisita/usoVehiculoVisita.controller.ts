import { Request, Response } from 'express'
import { UsoVehiculoVisitaService } from './usoVehiculoVisita.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'

const usoService = new UsoVehiculoVisitaService()

/**
 * Controlador para manejar las rutas de los usos de vehículos por visita.
 */
export class UsoVehiculoVisitaController {
  create = catchAsync(async (req: Request, res: Response) => {
    const nuevoUso = await usoService.create(req.body)
    return sendSuccess(res, nuevoUso, 'Uso de vehículo registrado exitosamente', 201)
  })

  getAll = catchAsync(async (req: Request, res: Response) => {
    const usos = await usoService.findAll()
    return sendSuccess(res, usos)
  })

  getOne = catchAsync(async (req: Request, res: Response) => {
    const cod_visita = parseInt(req.params.cod_visita, 10)
    const patente = req.params.patente
    const uso = await usoService.findById(cod_visita, patente)
    return sendSuccess(res, uso)
  })

  update = catchAsync(async (req: Request, res: Response) => {
    const cod_visita = parseInt(req.params.cod_visita, 10)
    const patente = req.params.patente
    const uso = await usoService.update(cod_visita, patente, req.body)
    return sendSuccess(res, uso, 'Uso de vehículo actualizado exitosamente')
  })

  remove = catchAsync(async (req: Request, res: Response) => {
    const cod_visita = parseInt(req.params.cod_visita, 10)
    const patente = req.params.patente
    await usoService.remove(cod_visita, patente)
    return res.status(204).send()
  })
}
