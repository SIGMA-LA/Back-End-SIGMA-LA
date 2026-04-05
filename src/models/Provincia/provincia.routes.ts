import { Router } from 'express'
import { ProvinciaController } from './provincia.controller.js'

const provinciaController = new ProvinciaController()
const provinciaRouter = Router()

provinciaRouter.get('/', provinciaController.getAll)

provinciaRouter.get('/:id', provinciaController.getOne)

provinciaRouter.post('/', provinciaController.create)


export default provinciaRouter
