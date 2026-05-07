import { Router } from 'express'
import { EntregaController } from './entrega.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'
import { idParamsSchema } from 'sigma-la-schemas'
const entregaController = new EntregaController()
const entregaRouter = Router()

entregaRouter.get('/', entregaController.getAll)

entregaRouter.get('/stats/progreso-diario', entregaController.getProgresoDiario)

entregaRouter.get('/:cuil_empleado/:estado', entregaController.getEntregasByEmpleadoEstado)

entregaRouter.post('/', authorize('entrega', 'crear'), entregaController.create)

entregaRouter.get('/:id', validate({ params: idParamsSchema }), entregaController.getOne)

entregaRouter.put('/:id', authorize('entrega', 'actualizar'), entregaController.update)

entregaRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  authorize('entrega', 'eliminar'),
  entregaController.remove,
)

entregaRouter.patch('/:id/finalizar', authorize('entrega', 'finalizar'), entregaController.finalizarEntrega)

entregaRouter.patch('/:id/cancelar', authorize('entrega', 'cancelar'), entregaController.cancelarEntrega)

// Gestión de órdenes de producción vinculadas a una entrega
entregaRouter.patch('/:id/ordenes-produccion', authorize('entrega', 'gestionarOrdenes'), entregaController.agregarOPs)

entregaRouter.delete('/:id/ordenes-produccion', authorize('entrega', 'gestionarOrdenes'), entregaController.quitarOPs)


export default entregaRouter
