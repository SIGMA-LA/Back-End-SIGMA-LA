import { Router } from 'express'
import { ParametroController } from './parametro.controller.js'

const parametroController = new ParametroController()
const parametroRouter = Router()

parametroRouter.get('/', (req, res) => {
  parametroController.getAll(req, res)
})

parametroRouter.post('/', (req, res) => {
  parametroController.create(req, res)
})

parametroRouter.get('/:fecha:hora', (req, res) => {
  parametroController.getOne(req, res)
})

parametroRouter.put('/:fecha:hora', (req, res) => {
  parametroController.update(req, res)
})

parametroRouter.delete('/:fecha:hora', (req, res) => {
  parametroController.remove(req, res)
})

export default parametroRouter
