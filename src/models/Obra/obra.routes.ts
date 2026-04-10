import { Router } from 'express'
import { ObraController } from './obra.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import {
  upload,
} from '../../shared/middlewares/upload.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'
import { idParamsSchema } from 'sigma-la-schemas'

const obraController = new ObraController()
const obraRouter = Router()

// ----------- FILTROS Y BÚSQUEDAS -----------
// Stats endpoints (must be before /:id routes)
obraRouter.get('/stats/admin', authorize('obra', 'statsAdmin'), obraController.getAdminStats)
obraRouter.get('/stats/ventas', authorize('obra', 'statsVentas'), obraController.getVentasStats)
obraRouter.get('/stats/coordinacion', authorize('obra', 'statsCoordinacion'), obraController.getCoordinacionStats)

// Obtener todas las obras
obraRouter.get('/', obraController.getAll)

// Filtrar obras por estado o localidad
obraRouter.get('/filtrar', obraController.filtrar)

// Buscar obras por texto (dirección, cliente, etc.)
obraRouter.get('/buscar', obraController.buscar)

// Obtener obras filtradas para crear entrega
obraRouter.get('/para-entrega', authorize('obra', 'verParaEntrega'), obraController.getObrasParaEntrega)

// Obtener obras de un cliente específico
obraRouter.get('/cliente/:cuil', obraController.getByCliente)

// Obtener obras listas para pedido de stock
obraRouter.get('/para-pedido-stock', authorize('obra', 'verParaPedidoStock'), obraController.getObrasParaPedidoStock)

// Obtener obras para Notas de Fábrica con filtros
obraRouter.get('/notas-fabrica', authorize('obra', 'verNotasFabrica'), obraController.getNotasFabrica)

// Obtener obras con nota de fábrica sin orden aprobada
obraRouter.get('/notas-sin-orden-aprobada', authorize('obra', 'verNotasFabrica'), obraController.getNotasSinOrdenAprobada)

// Obtener obras con nota de fábrica y orden en proceso
obraRouter.get('/notas-con-orden-proceso', authorize('obra', 'verNotasFabrica'), obraController.getNotasConOrdenEnProceso)

// Obtener obras con presupuesto aceptado
obraRouter.get('/con-presupuesto-aceptado', authorize('obra', 'verConPresupuestoAceptado'), obraController.getObrasConPresupuestoAceptado)

// Solicitar stock para una obra
obraRouter.patch('/:id/solicitar-stock', authorize('obra', 'solicitarStock'), obraController.solicitarStock)

// Confirmar recepción de stock
obraRouter.patch('/:id/recibir-stock', authorize('obra', 'recibirStock'), obraController.recibirStock)

// Finalizar producción de una obra
obraRouter.patch('/:id/finalizar-produccion', authorize('obra', 'finalizarProduccion'), obraController.finalizarProduccion)

// ----------- NOTA DE FÁBRICA -----------

// Subir nota de fábrica a una obra
obraRouter.post('/:cod_obra/nota-fabrica', authorize('obra', 'gestionarNotaFabrica'), upload.single('file'), obraController.subirNotaFabrica)

// Eliminar nota de fábrica de una obra
obraRouter.delete('/:cod_obra/nota-fabrica', authorize('obra', 'gestionarNotaFabrica'), obraController.deleteNotaFabrica)

// ----------- CRUD DE OBRAS -----------

// Crear una nueva obra
obraRouter.post('/', authorize('obra', 'crear'), obraController.create)

// Obtener una obra por ID
obraRouter.get('/:id', validate({ params: idParamsSchema }), obraController.getOne)

// Actualizar una obra por ID
obraRouter.put(
  '/:id',
  authorize('obra', 'actualizar'),
  validate({
    params: idParamsSchema,
  }),
  obraController.update,
)

// Eliminar una obra por ID
obraRouter.delete('/:id', authorize('obra', 'eliminar'), validate({ params: idParamsSchema }), obraController.remove)

export default obraRouter
