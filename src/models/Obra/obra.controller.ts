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
  // ----------- FILTROS Y BÚSQUEDAS -----------

  /** Filtra obras por estado, localidad o ambos */
  async filtrar(req: Request, res: Response) {
    try {
      const { estado, localidad } = req.query
      console.log(
        'Filtrando obras con estado:',
        estado,
        'y localidad:',
        localidad,
      )
      const obras = await obraService.filtrar({
        estado: estado as string | undefined,
        cod_localidad: localidad ? Number(localidad) : undefined,
      })
      res.json(obras)
    } catch (error) {
      res.status(500).json({ message: 'Error al filtrar obras', error })
    }
  }

  /** Busca obras por texto (dirección, cliente, etc.) */
  async buscar(req: Request, res: Response) {
    try {
      const q = req.query.q as string
      const obras = await obraService.buscar(q)
      res.json(obras)
    } catch (error) {
      res.status(500).json({ message: 'Error al buscar obras', error })
    }
  }

  /** Obtiene todas las obras */
  async getAll(req: Request, res: Response) {
    const obras = await obraService.findAll()
    res.status(201).json(obras)
  }

  /** Obtiene una obra por ID (usado internamente) */
  async getOneById(id: number) {
    return await obraService.findById(id)
  }

  /** Obtiene una obra por ID (endpoint) */
  async getOne(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    const obra = await obraService.findById(id)
    if (!obra) {
      return res.status(404).json({ message: 'Obra no encontrada' })
    }
    res.json(obra)
  }

  // ----------- NOTA DE FÁBRICA -----------

  /** Sube nota de fábrica a una obra */
  async subirNotaFabrica(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' })
    }
    await obraService.subirNotaFabrica(id, req.file)
    res.status(201).json({ message: 'Archivo subido correctamente' })
  }

  /** Elimina la nota de fábrica de una obra */
  async deleteNotaFabrica(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    await obraService.deleteNotaFabrica(id)
    res.json({ message: 'Nota de fábrica eliminada correctamente' })
  }

  /** Obtiene obras con nota de fábrica y orden en proceso */
  async getNotasConOrdenEnProceso(req: Request, res: Response) {
    const obras = await obraService.findNotasConOrdenEnProceso()
    res.json(obras)
  }

  // ----------- CRUD DE OBRAS -----------

  /** Crea una nueva obra */
  async create(req: Request, res: Response) {
    const nueva = await obraService.create(req.body)
    res.status(201).json(nueva)
  }

  /** Actualiza una obra por ID */
  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    const obra = await obraService.update(id, req.body)
    res.json(obra)
  }

  /** Baja lógica de una obra (cambia estado a CANCELADA) */
  async bajaLogica(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10)
      const obra = await obraService.bajaLogica(id)
      if (!obra) {
        return res.status(404).json({ message: 'Obra no encontrada' })
      }
      res.json({ message: 'Baja lógica realizada con éxito', obra })
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al realizar la baja lógica', error })
    }
  }

  /** Elimina una obra por ID (baja física) */
  async remove(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10)
    const obra = await obraService.remove(id)
    res.json(obra)
  }

  async getNotasSinOrdenAprobada(req: Request, res: Response) {
    const obras = await obraService.findNotasSinOrdenAprobada()
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

  /** Obtiene obras para pedido de stock */
  async getObrasParaPedidoStock(req: Request, res: Response) {
    try {
      const obras = await obraService.findObrasParaPedidoStock()
      res.json(obras)
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al obtener obras para pedido', error })
    }
  }

  /** Cambia el estado de una obra a EN ESPERA DE STOCK */
  async solicitarStock(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10)
      const obra = await obraService.solicitarStock(id)
      res.json({ message: 'Pedido de stock solicitado con éxito', obra })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(400).json({ message })
    }
  }

  /** Cambia el estado de una obra a EN PRODUCCION */
  async recibirStock(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10)
      const obra = await obraService.recibirStock(id)
      res.json({ message: 'Stock recibido y obra en producción', obra })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(400).json({ message })
    }
  }
}
