import { Router } from 'express'
import { VehiculoController } from './vehiculo.controller.js'

const vehiculoController = new VehiculoController()
const vehiculoRouter = Router()

vehiculoRouter.get('/', (req, res) => {
  vehiculoController.getAll(req, res)
})

vehiculoRouter.post('/', (req, res) => {
  vehiculoController.create(req, res)
})

vehiculoRouter.get('/:id', (req, res) => {
  vehiculoController.getOne(req, res)
})

vehiculoRouter.put('/:id', (req, res) => {
  vehiculoController.update(req, res)
})

vehiculoRouter.delete('/:id', (req, res) => {
  vehiculoController.remove(req, res)
})

export default vehiculoRouter
