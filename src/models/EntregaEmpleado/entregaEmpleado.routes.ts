import { Router } from 'express'
import { EntregaEmpleadoController } from './entregaEmpleado.controller.js'

const entregaEmpleadoController = new EntregaEmpleadoController()
const entregaEmpleadoRouter = Router()

entregaEmpleadoRouter.get('/', (req, res) => {
  entregaEmpleadoController.getAll(req, res)
})

entregaEmpleadoRouter.post('/', (req, res) => {
  entregaEmpleadoController.create(req, res)
})

entregaEmpleadoRouter.get('/:cod_entrega/:cuil', (req, res) => {
  entregaEmpleadoController.getOne(req, res)
})

entregaEmpleadoRouter.put('/:cod_entrega/:cuil', (req, res) => {
  entregaEmpleadoController.update(req, res)
})

entregaEmpleadoRouter.delete('/:cod_entrega/:cuil', (req, res) => {
  entregaEmpleadoController.remove(req, res)
})

export default entregaEmpleadoRouter
