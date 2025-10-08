import { Router } from 'express'
import { ProvinciaController } from './provincia.controller.js'

const provinciaController = new ProvinciaController()
const provinciaRouter = Router()

provinciaRouter.get('/', (req, res) => {
  provinciaController.getAll(req, res)
})

provinciaRouter.post(
  '/',
  (req, res) => {
    provinciaController.create(req, res)
  },
)

export default provinciaRouter
