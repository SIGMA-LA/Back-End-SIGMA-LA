import { ObraService } from './obra.service.js'
import { Request, Response } from 'express'
import type { NotasFabricaFilters } from './obra.repository.js'

const obraService = new ObraService()
type NotasFabricaEstado = NotasFabricaFilters['estado']
const NOTAS_FABRICA_ESTADOS = [
  'SIN_ORDEN',
  'EN_PRODUCCION',
  'FINALIZADA',
] as const

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

  /** Obtiene obras de un cliente específico */
  async getByCliente(req: Request, res: Response) {
    try {
      const cuil = req.params.cuil
      const obras = await obraService.findByCliente(cuil)
      res.json(obras)
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al obtener obras por cliente', error })
    }
  }

  /** Obtiene todas las obras */
  async getAll(req: Request, res: Response) {
    const obras = await obraService.findAll()
    res.status(200).json(obras)
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

  /** Obtiene obras para Notas de Fábrica según filtros de frontend */
  async getNotasFabrica(req: Request, res: Response) {
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

      const normalizeQueryValue = (value?: string) => {
        if (!value) return undefined
        const normalized = value.trim()
        if (!normalized) return undefined
        if (normalized === 'undefined' || normalized === 'null') return undefined
        return normalized
      }

      const normalizedEstado = normalizeQueryValue(estado)
      const normalizedFechaDesde = normalizeQueryValue(fechaDesde)
      const normalizedFechaHasta = normalizeQueryValue(fechaHasta)

      if (!normalizedEstado) {
        return res.status(400).json({
          message: 'El query param "estado" es obligatorio',
        })
      }

      if (
        !NOTAS_FABRICA_ESTADOS.includes(normalizedEstado as NotasFabricaEstado)
      ) {
        return res.status(400).json({
          message:
            'El estado debe ser SIN_ORDEN, EN_PRODUCCION o FINALIZADA',
        })
      }

      const fechaDesdeDate = normalizedFechaDesde
        ? new Date(normalizedFechaDesde)
        : null
      const fechaHastaDate = normalizedFechaHasta
        ? new Date(normalizedFechaHasta)
        : null

      if (normalizedFechaDesde && Number.isNaN(fechaDesdeDate?.getTime())) {
        return res.status(400).json({ message: 'fechaDesde inválida' })
      }

      if (normalizedFechaHasta && Number.isNaN(fechaHastaDate?.getTime())) {
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

      const obras = await obraService.findNotasFabrica({
        estado: normalizedEstado as NotasFabricaEstado,
        fechaDesde: normalizedFechaDesde,
        fechaHasta: normalizedFechaHasta,
      })

      res.status(200).json(obras)
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener notas de fábrica',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /** Sube nota de fábrica a una obra */
  async subirNotaFabrica(req: Request, res: Response) {
    const codObra = Number.parseInt(req.params.cod_obra, 10)

    if (Number.isNaN(codObra)) {
      return res.status(400).json({ message: 'Código de obra inválido' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' })
    }

    const obraExistente = await obraService.findById(codObra)
    if (!obraExistente) {
      return res.status(404).json({ message: 'Obra no encontrada' })
    }

    const obra = await obraService.subirNotaFabrica(codObra, req.file)
    res.status(201).json(obra)
  }

  /** Elimina la nota de fábrica de una obra */
  async deleteNotaFabrica(req: Request, res: Response) {
    const codObra = Number.parseInt(req.params.cod_obra, 10)

    if (Number.isNaN(codObra)) {
      return res.status(400).json({ message: 'Código de obra inválido' })
    }

    const obra = await obraService.deleteNotaFabrica(codObra)
    res.status(200).json(obra)
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
