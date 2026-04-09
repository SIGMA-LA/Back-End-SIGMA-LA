import { Router } from 'express'
import { VisitaController } from './visita.controller.js'
import { idParamsSchema } from 'sigma-la-schemas'
import { validate } from '../../shared/middlewares/validateSchemas.js'

const visitaController = new VisitaController()
const visitaRouter = Router()

visitaRouter.get('/', visitaController.getAll)

visitaRouter.get('/stats/progreso-diario', visitaController.getProgresoDiario)

visitaRouter.post('/', visitaController.create)

visitaRouter.get('/buscar', visitaController.buscar)

visitaRouter.get('/:id', validate({ params: idParamsSchema }), visitaController.getOne)

/**
 * [PARCHE TEMPORAL]
 * Se ha deshabilitado la validación de Valibot (validate()) para esta ruta PUT 
 * debido a inconsistencias en el paquete 'sigma-la-schemas':
 * 
 * 1. El validador 'isoDateTime' en 'updateVisitaSchema' es extremadamente estricto
 *    y rechaza formatos ISO estándar (con segundos o sufijo Z) que el servicio 
 *    y la base de datos sí aceptan correctamente.
 * 2. Esto causaba errores de validación 400 incluso con datos correctos.
 * 
 * TODO: Corregir los esquemas en 'sigma-la-schemas' para usar un formato de fecha
 * más flexible o una expresión regular antes de reactivar este middleware.
 */
visitaRouter.put('/:id', visitaController.update)

visitaRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  visitaController.remove,
)

visitaRouter.get('/empleado/:cuil/:estado', visitaController.getVisitasByEmpleadoAndEstado)

// GET /api/visitas/empleado/:cuil - Todas las visitas de un empleado
visitaRouter.get('/empleado/:cuil', visitaController.getVisitasByEmpleado)

// GET /api/visitas/obra/:cod_obra - Visitas asociadas a una obra
visitaRouter.get('/obra/:cod_obra', visitaController.getVisitasByObra)

visitaRouter.patch('/:id/finalizar', visitaController.finalizarVisita)

visitaRouter.patch('/:id/cancelar', visitaController.cancelarVisita)


export default visitaRouter
