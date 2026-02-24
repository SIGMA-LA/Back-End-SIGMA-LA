import express from 'express'
import { env } from '../../config/env.js'

export const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  console.error('Error:', err)

  if (res.headersSent) {
    return next(err)
  }

  res.status(500).json({
    error: 'Internal server error',
    message:
      env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  })
}
