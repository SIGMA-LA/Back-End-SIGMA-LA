import { Router } from 'express'
import { ClienteController } from './cliente.controller'

const router = Router()
const controller = new ClienteController()

router.post('/', (req, res) => controller.create(req, res))
router.get('/', (req, res) => controller.getAll(req, res))
router.get('/:cuil', (req, res) => controller.getOne(req, res))
router.put('/:cuil', (req, res) => controller.update(req, res))
router.delete('/:cuil', (req, res) => controller.remove(req, res))

export default router
