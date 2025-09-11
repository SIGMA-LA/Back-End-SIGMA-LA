import { Router } from 'express'
import { ClienteController } from './cliente.controller.js'

const clienteController = new ClienteController()
const clienteRouter = Router()

clienteRouter.get('/', (req, res) => {
  clienteController.getAll(req, res)
})

clienteRouter.post('/', (req, res) => {
  clienteController.create(req, res)
})

clienteRouter.get('/:cuil', (req, res) => {
  clienteController.getOne(req, res)
})

clienteRouter.put('/:cuil', (req, res) => {
  clienteController.update(req, res)
})

clienteRouter.delete('/:cuil', (req, res) => {
  clienteController.remove(req, res)
})

export default clienteRouter
