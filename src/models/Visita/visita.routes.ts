import { Router } from 'express'
import { VisitaController } from './visita.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { updateVisitaSchema, idParamsSchema } from 'sigma-la-schemas'

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

visitaRouter.put(
  '/:id',
  validate({
    params: idParamsSchema,
    body: updateVisitaSchema,
  }),
  (req, res) => {
    visitaController.update(req, res)
  },
)

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
