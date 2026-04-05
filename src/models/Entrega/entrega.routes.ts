import { Router } from 'express'
import { EntregaController } from './entrega.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { idParamsSchema } from 'sigma-la-schemas'
const entregaController = new EntregaController()
const entregaRouter = Router()

entregaRouter.get('/', entregaController.getAll)

entregaRouter.get('/:cuil_empleado/:estado', entregaController.getEntregasByEmpleadoEstado)

entregaRouter.post('/', entregaController.create)

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
entregaRouter.put('/:id', entregaController.update)

entregaRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  entregaController.remove,
)

entregaRouter.patch('/:id/finalizar', entregaController.finalizarEntrega)

entregaRouter.patch('/:id/cancelar', entregaController.cancelarEntrega)

// Gestión de órdenes de producción vinculadas a una entrega
entregaRouter.patch('/:id/ordenes-produccion', entregaController.agregarOPs)

entregaRouter.delete('/:id/ordenes-produccion', entregaController.quitarOPs)


export default entregaRouter
