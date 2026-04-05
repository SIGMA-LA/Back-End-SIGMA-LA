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
obraRouter.get('/', obraController.getAll)

// Filtrar obras por estado o localidad
obraRouter.get('/filtrar', obraController.filtrar)

// Buscar obras por texto (dirección, cliente, etc.)
obraRouter.get('/buscar', obraController.buscar)

// Obtener obras filtradas para crear entrega
obraRouter.get('/para-entrega', obraController.getObrasParaEntrega)

// Obtener obras de un cliente específico
obraRouter.get('/cliente/:cuil', obraController.getByCliente)

// Obtener obras listas para pedido de stock
obraRouter.get('/para-pedido-stock', obraController.getObrasParaPedidoStock)

// Obtener obras para Notas de Fábrica con filtros
obraRouter.get('/notas-fabrica', obraController.getNotasFabrica)

// Obtener obras con nota de fábrica sin orden aprobada
obraRouter.get('/notas-sin-orden-aprobada', obraController.getNotasSinOrdenAprobada)

// Obtener obras con nota de fábrica y orden en proceso
obraRouter.get('/notas-con-orden-proceso', obraController.getNotasConOrdenEnProceso)

// Obtener obras con presupuesto aceptado
obraRouter.get('/con-presupuesto-aceptado', obraController.getObrasConPresupuestoAceptado)

// Solicitar stock para una obra
obraRouter.patch('/:id/solicitar-stock', obraController.solicitarStock)

// Confirmar recepción de stock
obraRouter.patch('/:id/recibir-stock', obraController.recibirStock)

// ----------- NOTA DE FÁBRICA -----------

// Subir nota de fábrica a una obra
obraRouter.post('/:cod_obra/nota-fabrica', upload.single('file'), obraController.subirNotaFabrica)

// Eliminar nota de fábrica de una obra
obraRouter.delete('/:cod_obra/nota-fabrica', obraController.deleteNotaFabrica)

// ----------- CRUD DE OBRAS -----------

// Crear una nueva obra
obraRouter.post('/', obraController.create)

// Obtener una obra por ID
obraRouter.get('/:id', validate({ params: idParamsSchema }), obraController.getOne)

// Actualizar una obra por ID
obraRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
  }),
  obraController.update,
)

// Eliminar una obra por ID
obraRouter.delete('/:id', validate({ params: idParamsSchema }), obraController.remove)

export default obraRouter
