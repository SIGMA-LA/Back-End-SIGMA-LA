import { Router } from 'express'
import { VehiculoController } from './vehiculo.controller.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'

const vehiculoController = new VehiculoController()
const vehiculoRouter = Router()

vehiculoRouter.get('/', vehiculoController.getAll)

vehiculoRouter.post('/', authorize('vehiculo', 'crear'), vehiculoController.create)

vehiculoRouter.get('/disponibilidad', vehiculoController.getDisponibilidadPorFecha)

vehiculoRouter.get('/disponibles', vehiculoController.getDisponibles)

vehiculoRouter.get('/:patente', authorize('vehiculo', 'obtener'), vehiculoController.getOne)

vehiculoRouter.get('/:patente/usos-programados', authorize('vehiculo', 'obtener'), vehiculoController.getUsosProgramados)

vehiculoRouter.put('/:patente', authorize('vehiculo', 'actualizar'), vehiculoController.update)

vehiculoRouter.delete('/:patente', authorize('vehiculo', 'eliminar'), vehiculoController.remove)


export default vehiculoRouter
