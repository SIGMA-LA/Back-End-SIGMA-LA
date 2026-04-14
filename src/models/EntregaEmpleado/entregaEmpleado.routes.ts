import { Router } from 'express'
import { EntregaEmpleadoController } from './entregaEmpleado.controller.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'

const entregaEmpleadoController = new EntregaEmpleadoController()
const entregaEmpleadoRouter = Router()

entregaEmpleadoRouter.get('/', entregaEmpleadoController.getAll)

entregaEmpleadoRouter.post('/', authorize('entregaEmpleado', 'crear'), entregaEmpleadoController.create)

entregaEmpleadoRouter.get('/:id/:cuil', entregaEmpleadoController.getOne)

entregaEmpleadoRouter.put('/:id/:cuil', authorize('entregaEmpleado', 'actualizar'), entregaEmpleadoController.update)

entregaEmpleadoRouter.delete('/:id/:cuil', authorize('entregaEmpleado', 'eliminar'), entregaEmpleadoController.remove)


export default entregaEmpleadoRouter
