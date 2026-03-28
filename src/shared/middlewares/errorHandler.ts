import express from 'express'
import { Prisma } from '@prisma/client'
import { env } from '../../config/env.js'

interface ApiErrorPayload {
  status?: number
  code?: string
  message?: string
  details?: unknown
}

const isApiErrorPayload = (value: unknown): value is ApiErrorPayload => {
  if (!value || typeof value !== 'object') {
    return false
  }

  return true
}

export const errorHandler = (
  err: unknown,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  console.error('Error:', err)

  if (res.headersSent) {
    return next(err)
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2003'
  ) {
    return res.status(409).json({
      code: 'CLIENTE_CON_DEPENDENCIAS',
      message:
        'No se puede eliminar el cliente porque tiene obras o visitas asociadas. Debe desvincularlas antes.',
    })
  }

  if (isApiErrorPayload(err) && typeof err.status === 'number') {
    return res.status(err.status).json({
      code: err.code ?? 'APPLICATION_ERROR',
      message: err.message ?? 'Error de aplicacion',
      details: err.details,
    })
  }

  const message = err instanceof Error ? err.message : 'Something went wrong'

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: env.NODE_ENV === 'development' ? message : 'Something went wrong',
  })
}
