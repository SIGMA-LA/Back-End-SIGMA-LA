import { Router } from 'express'

const router = Router()

// welcome endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SIGMA-LA Backend API',
    version: '1.0.0',
  })
})

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

/* 
Rutas de entidades - ejemplos de implementación:

import empleadosRoutes from '../../models/Empleado/empleado.routes.js'
import clientesRoutes from '../../models/Cliente/cliente.routes.js'
import vehiculosRoutes from '../../models/Vehiculo/vehiculo.routes.js'

router.use('/api/empleados', empleadosRoutes)
router.use('/api/clientes', clientesRoutes)
router.use('/api/vehiculos', vehiculosRoutes)
*/

import empleadoRouter from '../../models/Empleado/empleado.routes.js'
import vehiculoRouter from '../../models/Vehiculo/vehiculo.routes.js'
import clienteRouter from '../../models/Cliente/cliente.routes.js'
import localidadRouter from '../../models/Localidad/localidad.routes.js'
import maquinariaRouter from '../../models/Maquinaria/maquinaria.routes.js'
import parametroRouter from '../../models/Parametro/parametro.routes.js'
import obraRouter from '../../models/Obra/obra.routes.js'
import ordenProduccionRouter from '../../models/OrdenProduccion/ordenProduccion.routes.js'
import entregaRouter from '../../models/Entrega/entrega.routes.js'
import usoVehiculoVisitaRouter from '../../models/UsoVehiculoVisita/usoVehiculoVisita.routes.js'
import pagoRouter from '../../models/Pago/pago.routes.js'
import usoVehiculoEntregaRouter from '../../models/UsoVehiculoEntrega/usoVehiculoEntrega.routes.js'
import presupuestoRouter from '../../models/Presupuesto/presupuesto.routes.js'
import usoMaquinariaRouter from '../../models/UsoMaquinaria/usoMaquinaria.routes.js'
import visitaRouter from '../../models/Visita/visita.routes.js'
import entregaEmpleadoRouter from '../../models/EntregaEmpleado/entregaEmpleado.routes.js'
import visitaEmpleadoRouter from '../../models/VisitaEmpleado/visitaEmpleado.routes.js'

import routeMid from '../../models/midlewareTest/mid.routes.js'
import provinciaRouter from '../../models/Provincia/provincia.routes.js'

router.use('/api/empleados', empleadoRouter)
router.use('/api/vehiculos', vehiculoRouter)
router.use('/api/clientes', clienteRouter)
router.use('/api/localidades', localidadRouter)
router.use('/api/maquinarias', maquinariaRouter)
router.use('/api/parametros', parametroRouter)
router.use('/api/obras', obraRouter)
// Endpoint específico para obras con presupuesto aceptado
router.get('/api/obras-con-presupuesto', (req, res) => {
  import('../../models/Obra/obra.controller.js').then(({ ObraController }) => {
    const controller = new ObraController()
    controller.getObrasConPresupuestoAceptado(req, res)
  })
})
router.use('/api/ordenes-produccion', ordenProduccionRouter)
router.use('/api/entregas', entregaRouter)
router.use('/api/uso-vehiculo-visitas', usoVehiculoVisitaRouter)
router.use('/api/uso-vehiculo-entregas', usoVehiculoEntregaRouter)
router.use('/api/test/mid/', routeMid)
router.use('/api/pagos', pagoRouter)
router.use('/api/uso-maquinaria', usoMaquinariaRouter)
router.use('/api/presupuestos', presupuestoRouter)
router.use('/api/visitas', visitaRouter)
router.use('/api/entrega-empleado', entregaEmpleadoRouter)
router.use('/api/empleado-visita', visitaEmpleadoRouter)
router.use('/api/provincias', provinciaRouter)

router.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
  })
})

export default router
