import { Request, Response } from 'express'
import { ClienteService } from './cliente.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

const clienteService = new ClienteService()

/**
 * Controlador para manejar las rutas de clientes.
 */
export class ClienteController {
  create = catchAsync(async (req: Request, res: Response) => {
    const cliente = await clienteService.create(req.body)
    return sendSuccess(res, cliente, 'Cliente creado exitosamente', 201)
  })

  getAll = catchAsync(async (req: Request, res: Response) => {
    const clientes = await clienteService.findAll()
    return sendSuccess(res, clientes)
  })

  getOne = catchAsync(async (req: Request, res: Response) => {
    const cuil = req.params.cuil
    const cliente = await clienteService.findById(cuil)
    return sendSuccess(res, cliente)
  })

  buscar = catchAsync(async (req: Request, res: Response) => {
    const q = String(req.query.q ?? '').trim()
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10))
    const pageSize = Math.max(
      1,
      Math.min(100, parseInt(String(req.query.pageSize ?? '25'), 10)),
    )

    if (!q) {
      throw new AppError('Parámetro "q" es requerido', 400, 'QUERY_PARAM_REQUIRED')
    }

    const clientes = await clienteService.buscar(q, page, pageSize)
    return sendSuccess(res, clientes)
  })

  update = catchAsync(async (req: Request, res: Response) => {
    const cuil = req.params.cuil
    const cliente = await clienteService.update(cuil, req.body)
    return sendSuccess(res, cliente, 'Cliente actualizado exitosamente')
  })

  remove = catchAsync(async (req: Request, res: Response) => {
    const cuil = req.params.cuil
    await clienteService.remove(cuil)
    return res.status(204).send()
  })
}

