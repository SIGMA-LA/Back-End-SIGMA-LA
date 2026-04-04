import { Router } from 'express'
import { EntregaController } from './entrega.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { idParamsSchema } from 'sigma-la-schemas'
const entregaController = new EntregaController()
const entregaRouter = Router()

entregaRouter.get('/', (req, res) => {
  entregaController.getAll(req, res)
})

entregaRouter.get('/:cuil_empleado/:estado', (req, res) => {
  entregaController.getEntregasByEmpleadoEstado(req, res)
})

entregaRouter.post('/', (req, res) => {
  entregaController.create(req, res)
})

entregaRouter.get('/:id', validate({ params: idParamsSchema }), (req, res) => {
  entregaController.getOne(req, res)
})

/**
 * [PARCHE TEMPORAL]
 * Se ha deshabilitado la validación de Valibot (validate()) para esta ruta PUT 
 * debido a inconsistencias críticas en el paquete 'sigma-la-schemas':
 * 
 * 1. El 'updateEntregaSchema' oficial solo permite [cod_obra, fecha_hora_entrega, estado, observaciones, detalle].
 * 2. El esquema CARECE de los campos [dias_viaticos, empleados, vehiculos, maquinarias, fecha_salida_estimada, fecha_regreso_estimado], 
 *    los cuales SÍ son soportados y requeridos por el EntregaService.
 * 3. Existe un mismatch de roles: el esquema espera 'AYUDANTE' mientras que la DB/Service usan 'ACOMPANANTE'.
 * 4. El 'idParamsSchema' causa conflictos de transformación en el middleware.
 * 
 * TODO: Actualizar 'sigma-la-schemas' (v1.0.28+) para incluir todos los campos del servicio
 * y corregir los nombres de picklist para poder reactivar esta validación.
 */
entregaRouter.put('/:id', (req, res) => {
  entregaController.update(req, res)
})

entregaRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  (req, res) => {
    entregaController.remove(req, res)
  },
)

entregaRouter.patch('/:id/finalizar', (req, res) => {
  entregaController.finalizarEntrega(req, res)
})

entregaRouter.patch('/:id/cancelar', (req, res) => {
  entregaController.cancelarEntrega(req, res)
})

// Gestión de órdenes de producción vinculadas a una entrega
entregaRouter.patch('/:id/ordenes-produccion', (req, res) => {
  entregaController.agregarOPs(req, res)
})

entregaRouter.delete('/:id/ordenes-produccion', (req, res) => {
  entregaController.quitarOPs(req, res)
})

export default entregaRouter
