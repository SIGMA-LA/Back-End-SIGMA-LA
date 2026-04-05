import { Request, Response } from 'express'
import { VisitaEmpleadoService } from './visitaEmpleado.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'

const visitaEmpleadoService = new VisitaEmpleadoService()

/**
 * Controlador para manejar las rutas de las relaciones empleado-visita.
 */
export class VisitaEmpleadoController {
  create = catchAsync(async (req: Request, res: Response) => {
    const nuevaRelacion = await visitaEmpleadoService.create(req.body)
    return sendSuccess(res, nuevaRelacion, 'Relación empleado-visita creada exitosamente', 201)
  })

  getAll = catchAsync(async (req: Request, res: Response) => {
    const relaciones = await visitaEmpleadoService.findAll()
    return sendSuccess(res, relaciones)
  })

  getOne = catchAsync(async (req: Request, res: Response) => {
    const cuil = req.params.cuil
    const cod_visita = Number(req.params.cod_visita)
    const relacion = await visitaEmpleadoService.findById(cuil, cod_visita)
    return sendSuccess(res, relacion)
  })

  update = catchAsync(async (req: Request, res: Response) => {
    const cuil = req.params.cuil
    const cod_visita = Number(req.params.cod_visita)
    const relacion = await visitaEmpleadoService.update(
      cuil,
      cod_visita,
      req.body,
    )
    return sendSuccess(res, relacion, 'Relación empleado-visita actualizada exitosamente')
  })

  remove = catchAsync(async (req: Request, res: Response) => {
    const cuil = req.params.cuil
    const cod_visita = Number(req.params.cod_visita)
    await visitaEmpleadoService.remove(cuil, cod_visita)
    return res.status(204).send()
  })
}
