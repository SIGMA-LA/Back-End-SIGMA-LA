import { Router } from 'express'
import { MaquinariaController } from './maquinaria.controller'

const router = Router()
const controller = new MaquinariaController()

router.post('/', (req, res) => controller.create(req, res))
router.get('/', (req, res) => controller.getAll(req, res))
router.get('/:cod_maquina', (req, res) => controller.getOne(req, res))
router.put('/:cod_maquina', (req, res) => controller.update(req, res))
router.delete('/:cod_maquina', (req, res) => controller.remove(req, res))

export default router
