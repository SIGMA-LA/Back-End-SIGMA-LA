import { OrdenProduccionService } from './ordenProduccion.service.js'
import { Request, Response } from 'express'

const ordenService = new OrdenProduccionService()
const ORDEN_ESTADOS = ['PENDIENTE', 'APROBADA', 'EN PRODUCCION', 'FINALIZADA']

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
        message:
          error instanceof Error
            ? error.message
            : 'Error al crear orden de producción',
      })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { estado, fechaDesde, fechaHasta } = req.query as {
        estado?: string
        fechaDesde?: string
        fechaHasta?: string
      }

      const allowedQueryParams = new Set(['estado', 'fechaDesde', 'fechaHasta'])
      const invalidQueryParams = Object.keys(req.query).filter(
        key => !allowedQueryParams.has(key),
      )

      if (invalidQueryParams.length > 0) {
        return res.status(400).json({
          message:
            'Parámetros no permitidos. Solo se aceptan estado, fechaDesde y fechaHasta',
        })
      }

      if (estado && !ORDEN_ESTADOS.includes(estado)) {
        return res.status(400).json({
          message:
            'El estado debe ser PENDIENTE, APROBADA, EN PRODUCCION o FINALIZADA',
        })
      }

      const fechaDesdeDate = fechaDesde ? new Date(fechaDesde) : null
      const fechaHastaDate = fechaHasta ? new Date(fechaHasta) : null

      if (fechaDesde && Number.isNaN(fechaDesdeDate?.getTime())) {
        return res.status(400).json({ message: 'fechaDesde inválida' })
      }

      if (fechaHasta && Number.isNaN(fechaHastaDate?.getTime())) {
        return res.status(400).json({ message: 'fechaHasta inválida' })
      }

      if (
        fechaDesdeDate &&
        fechaHastaDate &&
        fechaDesdeDate.getTime() > fechaHastaDate.getTime()
      ) {
        return res.status(400).json({
          message: 'fechaDesde no puede ser mayor a fechaHasta',
        })
      }

      const ordenes = await ordenService.findAll({
        estado,
        fechaDesde,
        fechaHasta,
      })

      res.status(200).json(ordenes)
    } catch (error) {
      console.error('Error al obtener órdenes:', error)
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener órdenes de producción',
      })
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const cod_op = parseInt(req.params.cod_op, 10)

      if (isNaN(cod_op)) {
        return res.status(400).json({ message: 'Código de orden inválido' })
      }

      const orden = await ordenService.findById(cod_op)
      if (!orden) {
        return res.status(404).json({ message: 'Not found' })
      }
      res.status(200).json(orden)
    } catch (error) {
      console.error('Error al obtener orden:', error)
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener orden de producción',
      })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const cod_op = parseInt(req.params.cod_op, 10)

      if (isNaN(cod_op)) {
        return res.status(400).json({ message: 'Código de orden inválido' })
      }

      // Verificar que la orden existe
      const ordenExistente = await ordenService.findById(cod_op)
      if (!ordenExistente) {
        return res
          .status(404)
          .json({ message: 'Orden de producción no encontrada' })
      }

      const body = { ...req.body }
      if (typeof body.fecha_validacion === 'string') {
        const parsedDate = new Date(body.fecha_validacion)
        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: 'fecha_validacion inválida' })
        }
        body.fecha_validacion = parsedDate
      }

      const orden = await ordenService.update(cod_op, body)
      res.status(200).json(orden)
    } catch (error) {
      console.error('Error al actualizar orden:', error)
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'Error al actualizar orden de producción',
      })
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const cod_op = parseInt(req.params.cod_op, 10)

      if (isNaN(cod_op)) {
        return res.status(400).json({ message: 'Código de orden inválido' })
      }

      const orden = await ordenService.remove(cod_op)
      res.status(200).json(orden)
    } catch (error) {
      console.error('Error al eliminar orden:', error)

      if (
        error instanceof Error &&
        error.message.includes('No existe una orden')
      ) {
        return res.status(404).json({ message: error.message })
      }

      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'Error al eliminar orden de producción',
      })
    }
  }
  async getValidadas(req: Request, res: Response) {
    try {
      const ordenes = await ordenService.findValidadas()
      res.status(200).json(ordenes)
    } catch (error) {
      console.error('Error al obtener órdenes validadas:', error)
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener órdenes validadas',
      })
    }
  }

  async getEnProduccion(req: Request, res: Response) {
    try {
      const ordenes = await ordenService.findEnProduccion()
      res.status(200).json(ordenes)
    } catch (error) {
      console.error('Error al obtener órdenes en producción:', error)
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener órdenes en producción',
      })
    }
  }

  async iniciarProduccion(req: Request, res: Response) {
    try {
      const cod_op = parseInt(req.params.cod_op, 10)

      const orden = await ordenService.findById(cod_op)
      if (!orden) {
        return res
          .status(404)
          .json({ message: 'Orden de producción no encontrada' })
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
        return res
          .status(404)
          .json({ message: 'Orden de producción no encontrada' })
      }

      await ordenService.finalizarProduccion(cod_op)

      const { ObraService } = await import('../Obra/obra.service.js')
      const obraService = new ObraService()
      await obraService.update(orden.cod_obra, {
        estado: 'PRODUCCION FINALIZADA',
      })

      res.json({ message: 'Producción finalizada correctamente' })
    } catch (error) {
      console.error('Error al finalizar producción:', error)
      res.status(500).json({ message: 'Error al finalizar producción' })
    }
  }

  async getByObra(req: Request, res: Response) {
    try {
      const cod_obra = parseInt(req.params.cod_obra, 10)

      if (isNaN(cod_obra)) {
        return res.status(400).json({ message: 'Código de obra inválido' })
      }

      const ordenes = await ordenService.findByObra(cod_obra)
      res.status(200).json(ordenes)
    } catch (error) {
      console.error('Error al obtener órdenes por obra:', error)
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener órdenes por obra',
      })
    }
  }

  async getByObraAndFinalizada(req: Request, res: Response) {
    try {
      const cod_obra = parseInt(req.params.cod_obra, 10)

      if (isNaN(cod_obra)) {
        return res.status(400).json({ message: 'Código de obra inválido' })
      }

      const ordenes = await ordenService.findByObraAndFinalizada(cod_obra)
      res.status(200).json(ordenes)
    } catch (error) {
      console.error('Error al obtener órdenes por obra:', error)
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener órdenes por obra',
      })
    }
  }
}
