import { Router } from 'express'
import { OrdenProduccionController } from './ordenProduccion.controller.js'
import { upload } from '../../shared/middlewares/upload.middleware.js'

const ordenProduccionController = new OrdenProduccionController()
const ordenProduccionRouter = Router()

ordenProduccionRouter.get('/', (req, res) => {
  ordenProduccionController.getAll(req, res)
})

ordenProduccionRouter.get('/validadas', (req, res) => {
  ordenProduccionController.getValidadas(req, res)
})

ordenProduccionRouter.get('/en-produccion', (req, res) => {
  ordenProduccionController.getEnProduccion(req, res)
})

ordenProduccionRouter.post('/', 
  upload.single('file'),
  (req, res) => {
    ordenProduccionController.create(req, res)
  }
)

ordenProduccionRouter.get('/:cod_orden', (req, res) => {
  ordenProduccionController.getOne(req, res)
})

ordenProduccionRouter.put('/:cod_orden', (req, res) => {
  ordenProduccionController.update(req, res)
})

ordenProduccionRouter.delete('/:cod_orden', (req, res) => {
  ordenProduccionController.remove(req, res)
})

ordenProduccionRouter.get('/obra/:cod_obra', (req, res) => {
  ordenProduccionController.getByObra(req, res)
})

ordenProduccionRouter.post('/:cod_op/iniciar', (req, res) => {
  ordenProduccionController.iniciarProduccion(req, res)
})

ordenProduccionRouter.post('/:cod_op/finalizar', (req, res) => {
  ordenProduccionController.finalizarProduccion(req, res)
})

export default ordenProduccionRouter