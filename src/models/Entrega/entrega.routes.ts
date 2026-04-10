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
