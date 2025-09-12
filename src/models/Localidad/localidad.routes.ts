import { Router } from 'express'
import { LocalidadController } from './localidad.controller.js'

const localidadController = new LocalidadController()
const localidadRouter = Router()

localidadRouter.get('/', (req, res) => {
  localidadController.getAll(req, res)
})

localidadRouter.post('/', (req, res) => {
  localidadController.create(req, res)
})

localidadRouter.get('/:id', (req, res) => {
  localidadController.getOne(req, res)
})

localidadRouter.put('/:id', (req, res) => {
  localidadController.update(req, res)
})

localidadRouter.delete('/:id', (req, res) => {
  localidadController.remove(req, res)
})

export default localidadRouter
