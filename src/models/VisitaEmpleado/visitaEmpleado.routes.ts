import { Router } from 'express'
import { VisitaEmpleadoController } from './visitaEmpleado.controller.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'

const visitaEmpleadoController = new VisitaEmpleadoController()
const visitaEmpleadoRouter = Router()

visitaEmpleadoRouter.get('/', visitaEmpleadoController.getAll)

visitaEmpleadoRouter.post('/', authorize('visitaEmpleado', 'crear'), visitaEmpleadoController.create)

visitaEmpleadoRouter.get('/:cuil/:cod_visita', visitaEmpleadoController.getOne)

visitaEmpleadoRouter.put('/:cuil/:cod_visita', authorize('visitaEmpleado', 'actualizar'), visitaEmpleadoController.update)

visitaEmpleadoRouter.delete('/:cuil/:cod_visita', authorize('visitaEmpleado', 'eliminar'), visitaEmpleadoController.remove)


export default visitaEmpleadoRouter
