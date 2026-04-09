import { Request, Response } from 'express'
import { ClienteService } from './cliente.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess, sendPaginatedSuccess } from '../../shared/utils/apiResponse.js'
import { parsePagination } from '../../shared/utils/parsePagination.js'
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
    const q = req.query.q as string | undefined
    const pagination = parsePagination(req.query as Record<string, unknown>)

    const result = await clienteService.findAll(q, pagination)
    return sendPaginatedSuccess(res, result)
  })

  getOne = catchAsync(async (req: Request, res: Response) => {
    const cuil = req.params.cuil
    const cliente = await clienteService.findById(cuil)
    return sendSuccess(res, cliente)
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

