import { Router } from 'express'
import { VisitaEmpleadoController } from './visitaEmpleado.controller.js'

const visitaEmpleadoController = new VisitaEmpleadoController()
const visitaEmpleadoRouter = Router()

visitaEmpleadoRouter.get('/', (req, res) => {
  visitaEmpleadoController.getAll(req, res)
})

visitaEmpleadoRouter.post('/', (req, res) => {
  visitaEmpleadoController.create(req, res)
})

visitaEmpleadoRouter.get('/:cuil/:cod_visita', (req, res) => {
  visitaEmpleadoController.getOne(req, res)
})

visitaEmpleadoRouter.put('/:cuil/:cod_visita', (req, res) => {
  visitaEmpleadoController.update(req, res)
})

visitaEmpleadoRouter.delete('/:cuil/:cod_visita', (req, res) => {
  visitaEmpleadoController.remove(req, res)
})

export default visitaEmpleadoRouter
