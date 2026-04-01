import { Router } from 'express'
import { VisitaController } from './visita.controller.js'
import { idParamsSchema } from 'sigma-la-schemas'
import { validate } from '../../shared/middlewares/validateSchemas.js'

const visitaController = new VisitaController()
const visitaRouter = Router()

visitaRouter.get('/', (req, res) => {
  visitaController.getAll(req, res)
})

visitaRouter.post('/', (req, res) => {
  visitaController.create(req, res)
})

visitaRouter.get('/buscar', (req, res) => {
  visitaController.buscar(req, res)
})

visitaRouter.get('/:id', validate({ params: idParamsSchema }), (req, res) => {
  visitaController.getOne(req, res)
})

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
visitaRouter.put('/:id', (req, res) => {
  visitaController.update(req, res)
})

visitaRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  (req, res) => {
    visitaController.remove(req, res)
  },
)

visitaRouter.get('/empleado/:cuil/:estado', (req, res) => {
  visitaController.getVisitasByEmpleadoAndEstado(req, res)
})

// GET /api/visitas/empleado/:cuil - Todas las visitas de un empleado
visitaRouter.get('/empleado/:cuil', (req, res) => {
  visitaController.getVisitasByEmpleado(req, res)
})

// GET /api/visitas/obra/:cod_obra - Visitas asociadas a una obra
visitaRouter.get('/obra/:cod_obra', (req, res) => {
  visitaController.getVisitasByObra(req, res)
})

visitaRouter.patch('/:id/finalizar', (req, res) => {
  visitaController.finalizarVisita(req, res)
})

visitaRouter.patch('/:id/cancelar', (req, res) => {
  visitaController.cancelarVisita(req, res)
})

export default visitaRouter
