import * as Sentry from '@sentry/node'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { env } from './config/env.js'
import ROUTES from './shared/routes/index.routes.js'
import authRouter from './models/Auth/auth.routes.js'
import { authenticateJWT } from './models/Auth/auth.middleware.js'
import { errorHandler } from './shared/middlewares/errorHandler.js'
import healthRouter from './shared/routes/health.routes.js'

const app = express()
const PORT = env.PORT

const globalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiadas solicitudes, intenta nuevamente en un minuto.',
  },
  handler: (req, res, _next, options) => {
    console.warn(
      `[RATE_LIMIT][GLOBAL] Bloqueado ${req.ip} en ${req.method} ${req.originalUrl}`,
    )

    res.status(options.statusCode).json(options.message)
  },
})

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === env.FRONTEND_URL) {
        callback(null, true)
        return
      }

      callback(new Error('CORS bloqueado para este origen'))
    },
    credentials: true,
  }),
)

app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use('/api', globalRateLimit)

app.use('/api', healthRouter)

app.use('/api/auth', authRouter)

app.use('/api', (req, res, next) => {
  if (req.path === '/login' || req.path === '/login/') {
    authRouter(req, res, next)
    return
  }

  next()
})

app.use(authenticateJWT)

app.use(ROUTES)

// Sentry error handler (must be before any other error handling middleware)
Sentry.setupExpressErrorHandler(app)

// error handler middleware
app.use(errorHandler)

if (env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
}

export default app
