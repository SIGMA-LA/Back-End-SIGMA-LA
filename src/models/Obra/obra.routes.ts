import { Router } from 'express'
import { ObraController } from './obra.controller'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { idParamsSchema } from '../../schemas/common.schema.js'
import { createObraSchema, updateObraSchema } from '../../schemas/obra.schemas'

const controller = new ObraController()
const router = Router()

router.get('/', (req, res) => {
  controller.getAll(req, res)
})

router.post('/', validate({ body: createObraSchema }), (req, res) => {
  controller.create(req, res)
})

router.get('/:cod_obra', validate({ params: idParamsSchema }), (req, res) => {
  controller.getOne(req, res)
})

router.put(
  '/:cod_obra',
  validate({
    params: idParamsSchema,
    body: updateObraSchema,
  }),
  (req, res) => {
    controller.update(req, res)
  },
)

router.delete(
  '/:cod_obra',
  validate({ params: idParamsSchema }),
  (req, res) => {
    controller.remove(req, res)
  },
)

export default controller
