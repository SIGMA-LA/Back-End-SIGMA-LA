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

  async buscar(req: Request, res: Response) {
    try {
      const q = req.query.q as string
      console.log('Buscando clientes con query:', q) // --- IGNORE ---
      const clientes = await clienteService.buscar(q)
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ message: 'Error al buscar clientes', error })
    }
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
