import { Router } from 'express'
import { VisitaEmpleadoController } from './visitaEmpleado.controller.js'

const visitaEmpleadoController = new VisitaEmpleadoController()
const visitaEmpleadoRouter = Router()

visitaEmpleadoRouter.get('/', visitaEmpleadoController.getAll)

visitaEmpleadoRouter.post('/', visitaEmpleadoController.create)

visitaEmpleadoRouter.get('/:cuil/:cod_visita', visitaEmpleadoController.getOne)

visitaEmpleadoRouter.put('/:cuil/:cod_visita', visitaEmpleadoController.update)

visitaEmpleadoRouter.delete('/:cuil/:cod_visita', visitaEmpleadoController.remove)


export default visitaEmpleadoRouter
