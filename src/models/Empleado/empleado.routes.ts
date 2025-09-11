import { Router } from 'express'
import { EmpleadoController } from './empleado.controller.js'

const empleadoController = new EmpleadoController()
const empleadoRouter = Router()

empleadoRouter.get('/', (req, res) => {
  empleadoController.getAll(req, res)
})

empleadoRouter.post('/', (req, res) => {
  empleadoController.create(req, res)
})

empleadoRouter.get('/:cuil', (req, res) => {
  empleadoController.getOne(req, res)
})

empleadoRouter.put('/:cuil', (req, res) => {
  empleadoController.update(req, res)
})

empleadoRouter.delete('/:cuil', (req, res) => {
  empleadoController.remove(req, res)
})

export default empleadoRouter
