import { Router } from 'express'
import { ObraController } from './obra.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  upload,
  deleteUploadedFile,
} from '../../shared/middlewares/upload.middleware.js'
import { idParamsSchema } from 'sigma-la-schemas'

const obraController = new ObraController()
const obraRouter = Router()

// ----------- FILTROS Y BÚSQUEDAS -----------
// Obtener todas las obras
obraRouter.get('/', (req, res) => {
  obraController.getAll(req, res)
})

// Filtrar obras por estado o localidad
obraRouter.get('/filtrar', (req, res) => {
  obraController.filtrar(req, res)
})

// Buscar obras por texto (dirección, cliente, etc.)
obraRouter.get('/buscar', (req, res) => {
  obraController.buscar(req, res)
})

// Obtener obras de un cliente específico
obraRouter.get('/cliente/:cuil_cliente', (req, res) => {
  obraController.getByCliente(req, res)
})

// Obtener obras listas para pedido de stock
obraRouter.get('/para-pedido-stock', (req, res) => {
  obraController.getObrasParaPedidoStock(req, res)
})

// Solicitar stock para una obra
obraRouter.patch('/:id/solicitar-stock', (req, res) => {
  obraController.solicitarStock(req, res)
})

// Confirmar recepción de stock
obraRouter.patch('/:id/recibir-stock', (req, res) => {
  obraController.recibirStock(req, res)
})

// ----------- NOTA DE FÁBRICA -----------

// Subir nota de fábrica a una obra
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

// Eliminar nota de fábrica de una obra
obraRouter.delete('/:id/nota-fabrica', (req, res) => {
  validate({ params: idParamsSchema })(req, res, async () => {
    try {
      const id = parseInt(req.params.id, 10)
      const obra = await obraController.getOneById(id)
      if (!obra) {
        return res.status(404).json({ message: 'Obra no encontrada' })
      }
      await deleteUploadedFile(obra.nota_fabrica_pid?.toString() || '')
      obraController.deleteNotaFabrica(req, res)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      res.status(500).json({ error: message })
    }
  })
})

// Obtener obras con nota de fábrica sin orden aprobada
obraRouter.get('/notas-sin-orden-aprobada', (req, res) => {
  obraController.getNotasSinOrdenAprobada(req, res)
})

// Obtener obras con nota de fábrica y orden en proceso
obraRouter.get('/notas-con-orden-proceso', (req, res) => {
  obraController.getNotasConOrdenEnProceso(req, res)
})

// Obtener obras con presupuesto aceptado
obraRouter.get('/con-presupuesto-aceptado', (req, res) => {
  obraController.getObrasConPresupuestoAceptado(req, res)
})

// ----------- CRUD DE OBRAS -----------

// Crear una nueva obra
obraRouter.post('/', (req, res) => {
  obraController.create(req, res)
})

// Obtener una obra por ID
obraRouter.get('/:id', validate({ params: idParamsSchema }), (req, res) => {
  obraController.getOne(req, res)
})

// Actualizar una obra por ID
obraRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
  }),
  (req, res) => {
    obraController.update(req, res)
  },
)

// Eliminar una obra por ID
obraRouter.delete('/:id', (req, res) => {
  validate({ params: idParamsSchema })(req, res, () => {})
  obraController.remove(req, res)
})

export default obraRouter
