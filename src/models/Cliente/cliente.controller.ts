import { Request, Response } from 'express'
import { ClienteService } from './cliente.service.js'

const clienteService = new ClienteService()

/**
 * Controlador para manejar las rutas de clientes.
 * @class ClienteController
 * @method create - Maneja la creación de un nuevo cliente.
 * @method getAll - Maneja la obtención de todos los clientes.
 * @method getOne - Maneja la obtención de un cliente por su CUIL.
 * @method update - Maneja la actualización de un cliente existente.
 * @method remove - Maneja la eliminación de un cliente por su CUIL.
 * @returns {Promise<void>} - Respuesta HTTP.
 * @throws {Error} - Si ocurre un error durante la operación.
 */
export class ClienteController {
  async create(req: Request, res: Response) {
    const cliente = await clienteService.create(req.body)
    res.status(201).json(cliente)
  }

  async getAll(req: Request, res: Response) {
    const clientes = await clienteService.findAll()
    res.json(clientes)
  }

  async getOne(req: Request, res: Response) {
    const cuil = req.params.cuil
    const cliente = await clienteService.findById(cuil)
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }
    res.json(cliente)
  }

  async buscar(req: Request, res: Response) {
    try {
      const q = String(req.query.q ?? '').trim()
      const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10))
      const pageSize = Math.max(
        1,
        Math.min(100, parseInt(String(req.query.pageSize ?? '25'), 10)),
      )

      if (!q) {
        return res.status(400).json({ message: 'Parametro "q" es requerido' })
      }

      const clientes = await clienteService.buscar(q, page, pageSize)
      return res.status(200).json(clientes)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      return res.status(500).json({ error: message })
    }
  }

  async update(req: Request, res: Response) {
    const cuil = req.params.cuil
    const cliente = await clienteService.update(cuil, req.body)
    res.json(cliente)
  }

  async remove(req: Request, res: Response) {
    const cuil = req.params.cuil
    const cliente = await clienteService.remove(cuil)
    res.json(cliente)
  }
}
