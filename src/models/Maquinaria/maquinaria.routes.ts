import { Router } from 'express'
import { MaquinariaController } from './maquinaria.controller.js'

const maquinariaController = new MaquinariaController()
const maquinariaRouter = Router()

maquinariaRouter.get('/', (req, res) => {
  maquinariaController.getAll(req, res)
})

maquinariaRouter.post('/', (req, res) => {
  maquinariaController.create(req, res)
})

maquinariaRouter.get('/:cod_maquina', (req, res) => {
  maquinariaController.getOne(req, res)
})

maquinariaRouter.put('/:cod_maquina', (req, res) => {
  maquinariaController.update(req, res)
})

maquinariaRouter.delete('/:cod_maquina', (req, res) => {
  maquinariaController.remove(req, res)
})

export default maquinariaRouter
