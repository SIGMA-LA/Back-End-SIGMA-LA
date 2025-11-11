import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

dotenv.config()

import ROUTES from './shared/routes/index.routes.js'
import authRouter from './models/Auth/auth.routes.js'
import { authenticateJWT } from './models/Auth/auth.middleware.js'
import { errorHandler } from './shared/middlewares/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 4000


app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
)


app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)

app.use(authenticateJWT)

app.use(ROUTES)

// error handler middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
