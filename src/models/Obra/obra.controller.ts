import { ObraService } from './obra.service.js'
import { Request, Response } from 'express'

const obraService = new ObraService()

/**
 * Controlador para manejar las rutas de las obras.
 * @class EmpleadoController
 * @method create - Maneja la creación de nueva obra.
 * @method getAll - Maneja la obtención de todos las obras.
 * @method getOne - Maneja la obtención de una obra por su codigo de obra.
 * @method update - Maneja la actualización de un obra existente.
 * @method remove - Maneja la eliminación de una obra por su codigo de obra.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class ObraController {
  async create(req: Request, res: Response) {
    const nueva = await obraService.create(req.body)
    res.status(201).json(nueva)
  }
  async buscar(req: Request, res: Response) {
    try {
      const q = req.query.q as string
      const obras = await obraService.buscar(q)
      res.json(obras)
    } catch (error) {
      res.status(500).json({ message: 'Error al buscar obras', error })
    }
  }

  async filtrar(req: Request, res: Response) {
    try {
      const { estado, localidad } = req.query
      const obras = await obraService.filtrar({
        estado: estado as string | undefined,
        cod_localidad: localidad ? Number(localidad) : undefined,
      })
      res.json(obras)
    } catch (error) {
      res.status(500).json({ message: 'Error al filtrar obras', error })
    }
  }

  async getAll(req: Request, res: Response) {
    const obras = await obraService.findAll()
    res.status(201).json(obras)
  }

  async getOneById(id: number) {
    return await obraService.findById(id)
  }

  async getOne(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    const obra = await obraService.findById(id)
    if (!obra) {
      return res.status(404).json({ message: 'Obra no encontrada' })
    }
    res.json(obra)
  }

  async subirNotaFabrica(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' })
    }
    await obraService.subirNotaFabrica(id, req.file)
    res.status(201).json({ message: 'Archivo subido correctamente' })
  }

  async deleteNotaFabrica(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    await obraService.deleteNotaFabrica(id)
    res.json({ message: 'Nota de fábrica eliminada correctamente' })
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    const obra = await obraService.update(id, req.body)
    res.json(obra)
  }

  async remove(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    const obra = await obraService.remove(id)
    res.json(obra)
  }

  async getNotasSinOrdenAprobada(req: Request, res: Response) {
    const obras = await obraService.findNotasSinOrdenAprobada()
    res.json(obras)
  }

  async getNotasConOrdenEnProceso(req: Request, res: Response) {
    const obras = await obraService.findNotasConOrdenEnProceso()
    res.json(obras)
  }

  async getObrasConPresupuestoAceptado(req: Request, res: Response) {
    try {
      let search = req.query.search as string

      // Sanitizar el input de búsqueda
      if (search) {
        search = search.trim().replace(/[<>{}]/g, '')
        // Limitar longitud para evitar ataques
        if (search.length > 100) {
          return res.status(400).json({
            message: 'El término de búsqueda es demasiado largo',
          })
        }
      }

      const obras = await obraService.findObrasConPresupuestoAceptado(search)
      res.json(obras)
    } catch (error) {
      console.error('Error al obtener obras con presupuesto aceptado:', error)
      res.status(500).json({
        message:
          'Error interno del servidor al obtener obras con presupuesto aceptado',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
