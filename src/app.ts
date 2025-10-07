import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import ROUTES from './shared/routes/index.routes.js'
import { errorHandler } from './shared/middlewares/errorHandler.js'
const app = express()
const PORT = process.env.PORT || 4000

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  }),
)

app.use(express.json())
app.use(ROUTES)

// error handler middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
