import { Router } from 'express'
import { ParametroController } from './parametro.controller'

const controller = new ParametroController()
const router = Router()

router.post('/', (req, res) => controller.create(req, res))
router.get('/', (req, res) => controller.getAll(req, res))
router.get('/:fecha:hora', (req, res) => controller.getOne(req, res))
router.put('/:fecha:hora', (req, res) => controller.update(req, res))
router.delete('/:fecha:hora', (req, res) => controller.remove(req, res))

export default router
