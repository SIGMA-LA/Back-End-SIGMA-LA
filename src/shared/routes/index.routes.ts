import { Router } from 'express'

const router = Router()

// welcome endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SIGMA-LA Backend API',
    version: '1.0.0',
  })
})

// not found endpoint
router.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
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

export default router
