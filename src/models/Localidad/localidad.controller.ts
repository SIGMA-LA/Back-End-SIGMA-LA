import { Request, Response } from 'express'
import { LocalidadService } from './localidad.service.js'
import { catchAsync } from '../../shared/utils/catchAsync.js'
import { sendSuccess } from '../../shared/utils/apiResponse.js'
import { AppError } from '../../shared/errors/AppError.js'

const localidadService = new LocalidadService()

/**
 * Controller to handle location (localidad) routes.
 */
export class LocalidadController {
  /**
   * Creates a new location.
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as any
    
    // Transform cod_provincia to provincia.connect if it comes directly
    const createData = { ...body }
    if (body.cod_provincia && !body.provincia) {
      createData.provincia = {
        connect: { cod_provincia: body.cod_provincia },
      }
      delete createData.cod_provincia
    }
    
    const localidad = await localidadService.create(createData)
    return sendSuccess(res, localidad, 'Location created successfully', 201)
  })

  /**
   * Gets all locations within a specific province.
   */
  getByProvincia = catchAsync(async (req: Request, res: Response) => {
    const { provinciaId } = req.params // Assuming it comes from params in some routes or needs to be handled
    const id = parseInt(provinciaId)
    if (isNaN(id)) throw new AppError('Invalid province ID', 400, 'INVALID_ID')

    const localidades = await localidadService.findByProvincia(id)
    return sendSuccess(res, localidades)
  })

  /**
   * Gets all location records or searches by name.
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { search } = req.query
    let localidades

    if (search && typeof search === 'string' && search.trim()) {
      localidades = await localidadService.search(search.trim())
    } else {
      localidades = await localidadService.findAll()
    }

    return sendSuccess(res, localidades)
  })

  /**
   * Gets a specific location by ID.
   */
  getOne = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) throw new AppError('Invalid location ID', 400, 'INVALID_ID')

    const localidad = await localidadService.findById(id)
    return sendSuccess(res, localidad)
  })

  /**
   * Updates an existing location record.
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) throw new AppError('Invalid location ID', 400, 'INVALID_ID')

    const localidad = await localidadService.update(id, req.body)
    return sendSuccess(res, localidad, 'Location updated successfully')
  })

  /**
   * Removes a location record.
   */
  remove = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) throw new AppError('Invalid location ID', 400, 'INVALID_ID')

    await localidadService.remove(id)
    return res.status(204).send()
  })
}

