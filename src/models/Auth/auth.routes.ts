import { Router, type NextFunction, type Request, type Response } from 'express'
import { AuthController } from './auth.controller.js'
import { validate } from '../../shared/middlewares/validateSchemas.js'
import { registerSchema, loginSchema } from './auth.schemas.js'
import { authenticateJWT } from './auth.middleware.js'
import { rateLimit } from 'express-rate-limit'

/**
 
Rutas para autenticación de empleados.
@returns {Router} - Router de Express*/
const authController = new AuthController()
const router = Router()

const loginAttemptLogger = (req: Request, _res: Response, next: NextFunction) => {
  const safeCuil = req.body?.cuil ? String(req.body.cuil) : 'sin-cuil'

  console.info(
    `[AUTH][LOGIN_ATTEMPT] ${new Date().toISOString()} ip=${req.ip} cuil=${safeCuil} ${req.method} ${req.originalUrl}`,
  )

  next()
}

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
  },
  handler: (req, res, _next, options) => {
    console.warn(
      `[RATE_LIMIT][LOGIN] Bloqueado ${req.ip} en ${req.method} ${req.originalUrl}`,
    )

    res.status(options.statusCode).json(options.message)
  },
})

router.post('/register', validate({ body: registerSchema }), (req, res) =>
  authController.register(req, res),
)
router.post(
  '/login',
  loginAttemptLogger,
  loginRateLimit,
  validate({ body: loginSchema }),
  (req, res) => authController.login(req, res),
)
router.post('/logout', (req, res) => authController.logout(req, res))

router.post('/refresh', (req, res) => authController.refresh(req, res))

router.get('/profile', authenticateJWT, (req, res) =>
  authController.getProfile(req, res),
)
export default router
