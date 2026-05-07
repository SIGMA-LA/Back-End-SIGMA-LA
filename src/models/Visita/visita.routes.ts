import { Router } from 'express'
import { VisitaController } from './visita.controller.js'
import { idParamsSchema } from 'sigma-la-schemas'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { authorize } from '../../shared/middlewares/authorizationRoles.js'

const visitaController = new VisitaController()
const visitaRouter = Router()

visitaRouter.get('/', visitaController.getAll)

visitaRouter.get('/stats/progreso-diario', visitaController.getProgresoDiario)

visitaRouter.get('/prospectos', visitaController.getProspectos)

visitaRouter.post('/', authorize('visita', 'crear'), visitaController.create)

visitaRouter.get('/buscar', visitaController.buscar)

visitaRouter.get('/:id', validate({ params: idParamsSchema }), visitaController.getOne)

visitaRouter.put('/:id', authorize('visita', 'actualizar'), visitaController.update)

visitaRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  authorize('visita', 'eliminar'),
  visitaController.remove,
)

visitaRouter.get('/empleado/:cuil/:estado', visitaController.getVisitasByEmpleadoAndEstado)

// GET /api/visitas/empleado/:cuil - Todas las visitas de un empleado
visitaRouter.get('/empleado/:cuil', visitaController.getVisitasByEmpleado)

// GET /api/visitas/obra/:cod_obra - Visitas asociadas a una obra
visitaRouter.get('/obra/:cod_obra', visitaController.getVisitasByObra)

visitaRouter.patch('/:id/finalizar', authorize('visita', 'finalizar'), visitaController.finalizarVisita)

visitaRouter.patch('/:id/cancelar', authorize('visita', 'cancelar'), visitaController.cancelarVisita)

visitaRouter.patch('/:id/re-solicitar', authorize('visita', 'reSolicitar'), visitaController.reSolicitar)


export default visitaRouter
