import { Router } from 'express'
import { EntregaEmpleadoController } from './entregaEmpleado.controller.js'

const entregaEmpleadoController = new EntregaEmpleadoController()
const entregaEmpleadoRouter = Router()

entregaEmpleadoRouter.get('/', entregaEmpleadoController.getAll)

entregaEmpleadoRouter.post('/', entregaEmpleadoController.create)

entregaEmpleadoRouter.get('/:id/:cuil', entregaEmpleadoController.getOne)

entregaEmpleadoRouter.put('/:id/:cuil', entregaEmpleadoController.update)

entregaEmpleadoRouter.delete('/:id/:cuil', entregaEmpleadoController.remove)


export default entregaEmpleadoRouter
