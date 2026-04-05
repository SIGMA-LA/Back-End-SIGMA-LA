import { Request, Response } from 'express'
import { UsoMaquinariaService } from './usoMaquinaria.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'

const usoService = new UsoMaquinariaService()

/**
 * Controlador para manejar las rutas de las maquinarias por uso.
 */
export class UsoMaquinariaController {
  create = catchAsync(async (req: Request, res: Response) => {
    const nuevoUso = await usoService.create(req.body)
    return sendSuccess(res, nuevoUso, 'Uso de maquinaria registrado exitosamente', 201)
  })

  getAll = catchAsync(async (req: Request, res: Response) => {
    const usos = await usoService.findAll()
    return sendSuccess(res, usos)
  })

  getOne = catchAsync(async (req: Request, res: Response) => {
    const { cod_maquina, cod_entrega } = req.params
    const uso = await usoService.findById(
      parseInt(cod_maquina, 10),
      parseInt(cod_entrega, 10),
    )
    return sendSuccess(res, uso)
  })

  update = catchAsync(async (req: Request, res: Response) => {
    const { cod_maquina, cod_entrega } = req.params
    const uso = await usoService.update(
      parseInt(cod_maquina, 10),
      parseInt(cod_entrega, 10),
      req.body,
    )
    return sendSuccess(res, uso, 'Uso de maquinaria actualizado exitosamente')
  })

  remove = catchAsync(async (req: Request, res: Response) => {
    const { cod_maquina, cod_entrega } = req.params
    await usoService.remove(
      parseInt(cod_maquina, 10),
      parseInt(cod_entrega, 10),
    )
    return res.status(204).send()
  })
}
