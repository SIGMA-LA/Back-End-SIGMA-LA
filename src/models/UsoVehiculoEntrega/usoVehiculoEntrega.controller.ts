import { Request, Response } from 'express'
import { UsoVehiculoEntregaService } from './usoVehiculoEntrega.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'

const usoService = new UsoVehiculoEntregaService()

/**
 * Controlador para manejar las rutas de los usos de vehículos por entrega.
 */
export class UsoVehiculoEntregaController {
  create = catchAsync(async (req: Request, res: Response) => {
    const nuevoUso = await usoService.create(req.body)
    return sendSuccess(res, nuevoUso, 'Uso de vehículo registrado exitosamente', 201)
  })

  getAll = catchAsync(async (req: Request, res: Response) => {
    const usos = await usoService.findAll()
    return sendSuccess(res, usos)
  })

  getOne = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = Number(req.params.cod_entrega)
    const patente = req.params.patente
    const uso = await usoService.findById(cod_entrega, patente)
    return sendSuccess(res, uso)
  })

  update = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = Number(req.params.cod_entrega)
    const patente = req.params.patente
    const uso = await usoService.update(cod_entrega, patente, req.body)
    return sendSuccess(res, uso, 'Uso de vehículo actualizado exitosamente')
  })

  remove = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = Number(req.params.cod_entrega)
    const patente = req.params.patente
    await usoService.remove(cod_entrega, patente)
    return res.status(204).send()
  })
}
