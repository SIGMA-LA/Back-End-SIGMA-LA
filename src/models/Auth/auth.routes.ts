import { Router } from 'express'
import { AuthController } from './auth.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { registerSchema, loginSchema } from './auth.schemas.js'

/**
 
Rutas para autenticación de empleados.
@returns {Router} - Router de Express*/
const authController = new AuthController()
const router = Router()

router.post('/register', validate({ body: registerSchema }), (req, res) =>
  authController.register(req, res),
)
router.post('/login', validate({ body: loginSchema }), (req, res) =>
  authController.login(req, res),
)

export default router
