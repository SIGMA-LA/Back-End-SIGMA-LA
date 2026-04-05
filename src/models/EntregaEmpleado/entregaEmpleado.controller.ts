import { Request, Response } from 'express'
import { EntregaEmpleadoService } from './entregaEmpleado.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'

const entregaEmpleadoService = new EntregaEmpleadoService()

/**
 * Controlador para manejar las rutas de las relaciones entrega-empleado.
 */
export class EntregaEmpleadoController {
  create = catchAsync(async (req: Request, res: Response) => {
    const nuevaRelacion = await entregaEmpleadoService.create(req.body)
    return sendSuccess(res, nuevaRelacion, 'Relación entrega-empleado creada exitosamente', 201)
  })

  getAll = catchAsync(async (req: Request, res: Response) => {
    const relaciones = await entregaEmpleadoService.findAll()
    return sendSuccess(res, relaciones)
  })

  getOne = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = Number(req.params.id)
    const cuil = req.params.cuil
    const relacion = await entregaEmpleadoService.findById(cod_entrega, cuil)
    return sendSuccess(res, relacion)
  })

  update = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = Number(req.params.id)
    const cuil = req.params.cuil
    const relacion = await entregaEmpleadoService.update(
      cod_entrega,
      cuil,
      req.body,
    )
    return sendSuccess(res, relacion, 'Relación entrega-empleado actualizada exitosamente')
  })

  remove = catchAsync(async (req: Request, res: Response) => {
    const cod_entrega = Number(req.params.id)
    const cuil = req.params.cuil
    await entregaEmpleadoService.remove(cod_entrega, cuil)
    return res.status(204).send()
  })
}
