import { OrdenProduccionService } from './ordenProduccion.service.js'
import { Request, Response } from 'express'

const ordenService = new OrdenProduccionService()

export class OrdenProduccionController {
  async create(req: Request, res: Response) {
  try {
    const { cod_obra } = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({ message: 'No se envió ningún archivo' })
    }

    const nueva = await ordenService.create({
      cod_obra: parseInt(cod_obra),
      url: file.path,
      public_id: file.filename,
    })

    res.status(201).json(nueva)
  } catch (error) {
    console.error('Error al crear orden:', error)
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Error al crear orden de producción' 
    })
  }
}

  async getAll(req: Request, res: Response) {
    const ordenes = await ordenService.findAll()
    res.status(200).json(ordenes)
  }

  async getOne(req: Request, res: Response) {
    const cod_orden = parseInt(req.params.cod_orden, 10)
    const orden = await ordenService.findById(cod_orden)
    if (!orden) {
      return res.status(404).json({ message: 'Orden de producción no encontrada' })
    }
    res.json(orden)
  }

  async update(req: Request, res: Response) {
    const cod_orden = parseInt(req.params.cod_orden, 10)
    const orden = await ordenService.update(cod_orden, req.body)
    res.json(orden)
  }

  async remove(req: Request, res: Response) {
    const cod_orden = parseInt(req.params.cod_orden, 10)
    const orden = await ordenService.remove(cod_orden)
    res.json(orden)

  }
    async getValidadas(req: Request, res: Response) {
  const ordenes = await ordenService.findValidadas()
  res.json(ordenes)
}

async getEnProduccion(req: Request, res: Response) {
  const ordenes = await ordenService.findEnProduccion()
  res.json(ordenes)
}

async iniciarProduccion(req: Request, res: Response) {
  try {
    const cod_op = parseInt(req.params.cod_op, 10)
    
    const orden = await ordenService.findById(cod_op)
    if (!orden) {
      return res.status(404).json({ message: 'Orden de producción no encontrada' })
    }

    await ordenService.update(cod_op, {
      estado: 'EN PRODUCCION',
    })

    const { ObraService } = await import('../Obra/obra.service.js')
    const obraService = new ObraService()
    
    await obraService.update(orden.cod_obra, {
      estado: 'EN PRODUCCION',
    })

    res.json({ message: 'Producción iniciada correctamente' })
  } catch (error) {
    console.error('Error al iniciar producción:', error)
    res.status(500).json({ message: 'Error al iniciar producción' })
  }
}

async finalizarProduccion(req: Request, res: Response) {
  try {
    const cod_op = parseInt(req.params.cod_op, 10)
    
    const orden = await ordenService.findById(cod_op)
    if (!orden) {
      return res.status(404).json({ message: 'Orden de producción no encontrada' })
    }

    await ordenService.finalizarProduccion(cod_op)

    res.json({ message: 'Producción finalizada correctamente' })
  } catch (error) {
    console.error('Error al finalizar producción:', error)
    res.status(500).json({ message: 'Error al finalizar producción' })
  }
}

async getByObra(req: Request, res: Response) {
  const cod_obra = parseInt(req.params.cod_obra, 10)
  const ordenes = await ordenService.findByObra(cod_obra)
  res.json(ordenes)
}

}
