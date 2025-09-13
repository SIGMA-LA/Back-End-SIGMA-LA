import { Router } from 'express'
import { AuthController } from './auth.controller.js'

/**
 * Rutas para autenticación de empleados.
 * @returns {Router} - Router de Express
 */
const authController = new AuthController()
const router = Router()

router.post('/register', (req, res) => authController.register(req, res))
router.post('/login', (req, res) => authController.login(req, res))

export default router
