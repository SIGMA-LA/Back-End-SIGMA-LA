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

vehiculoRouter.get('/disponibilidad', (req, res) => {
  vehiculoController.getDisponibilidadPorFecha(req, res)
})

vehiculoRouter.get('/disponibles', (req, res) => {
  vehiculoController.getDisponibles(req, res)
})

vehiculoRouter.get('/:patente', (req, res) => {
  vehiculoController.getOne(req, res)
})

vehiculoRouter.put('/:patente', (req, res) => {
  vehiculoController.update(req, res)
})

vehiculoRouter.delete('/:patente', (req, res) => {
  vehiculoController.remove(req, res)
})

export default vehiculoRouter
