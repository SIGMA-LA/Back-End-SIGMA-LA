import { Router } from 'express'
import { ObraController } from './obra.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  upload,
  deleteUploadedFile,
} from '../../shared/middlewares/upload.middleware.js'
import {
  createObraSchema,
  updateObraSchema,
  idParamsSchema,
} from 'sigma-la-schemas'

const obraController = new ObraController()
const obraRouter = Router()

obraRouter.get('/', (req, res) => {
  obraController.getAll(req, res)
})

obraRouter.post('/:id/nota-fabrica', (req, res) => {
  upload.single('file')(req, res, err => {
    if (err) {
      return res
        .status(400)
        .json({ message: 'Error al subir el archivo', error: err })
    }
    obraController.subirNotaFabrica(req, res)
  })
})

obraRouter.delete('/:id/nota-fabrica', (req, res) => {
  validate({ params: idParamsSchema })(req, res, async () => {
    const id = parseInt(req.params.id, 10)
    const obra = await obraController.getOneById(id)
    if (!obra) {
      return res.status(404).json({ message: 'Obra no encontrada' })
    }

    await deleteUploadedFile(obra.nota_fabrica_pid?.toString() || '')
    obraController.deleteNotaFabrica(req, res)
  })
})

obraRouter.get('/notas-sin-orden-aprobada', (req, res) => {
  obraController.getNotasSinOrdenAprobada(req, res)
})

obraRouter.get('/notas-con-orden-proceso', (req, res) => {
  obraController.getNotasConOrdenEnProceso(req, res)
})

obraRouter.post('/', validate({ body: createObraSchema }), (req, res) => {
  obraController.create(req, res)
})

obraRouter.get('/:id', validate({ params: idParamsSchema }), (req, res) => {
  obraController.getOne(req, res)
})

obraRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updateObraSchema,
  }),
  (req, res) => {
    obraController.update(req, res)
  },
)

obraRouter.delete('/:id', (req, res) => {
  validate({ params: idParamsSchema })(req, res, () => {})
  obraController.remove(req, res)
})

export default obraRouter
