import * as Sentry from '@sentry/node'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import ROUTES from './shared/routes/index.routes.js'
import authRouter from './models/Auth/auth.routes.js'
import { authenticateJWT } from './models/Auth/auth.middleware.js'
import { errorHandler } from './shared/middlewares/errorHandler.js'
import healthRouter from './shared/routes/health.routes.js'

const app = express()
const PORT = env.PORT

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
)

app.use(express.json())
app.use(cookieParser())

app.use('/api', healthRouter)

app.use('/api/auth', authRouter)

app.use(authenticateJWT)

app.use(ROUTES)

// Sentry error handler (must be before any other error handling middleware)
Sentry.setupExpressErrorHandler(app)

// error handler middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
