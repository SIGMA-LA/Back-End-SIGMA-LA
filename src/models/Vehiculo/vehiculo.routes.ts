import { Router } from 'express'
import { VehiculoController } from './vehiculo.controller.js'
const vehiculoController = new VehiculoController()
const vehiculoRouter = Router()

vehiculoRouter.get('/', vehiculoController.getAll)

vehiculoRouter.post('/', vehiculoController.create)

vehiculoRouter.get('/disponibilidad', vehiculoController.getDisponibilidadPorFecha)

vehiculoRouter.get('/disponibles', vehiculoController.getDisponibles)

vehiculoRouter.get('/:patente', vehiculoController.getOne)

vehiculoRouter.put('/:patente', vehiculoController.update)

vehiculoRouter.delete('/:patente', vehiculoController.remove)


export default vehiculoRouter
