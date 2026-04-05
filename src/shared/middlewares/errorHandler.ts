import express from 'express'
import { Prisma } from '@prisma/client'
import { env } from '../../config/env.js'
import { AppError } from '../errors/AppError.js'

export const errorHandler = (
  err: unknown,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (res.headersSent) {
    return next(err)
  }

  // Consistent error object structure
  let statusCode = 500
  let status = 'error'
  let errorCode = 'INTERNAL_SERVER_ERROR'
  let message = 'Algo salió mal'
  let details: unknown = undefined
  let isOperational = false

  if (err instanceof AppError) {
    statusCode = err.statusCode
    status = err.status
    errorCode = err.errorCode
    message = err.message
    details = err.details
    isOperational = err.isOperational
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400
    isOperational = true
    
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        statusCode = 409
        errorCode = 'DUPLICATE_ENTRY'
        message = 'Ya existe un registro con estos datos'
        details = err.meta
        break
      case 'P2003': // Foreign key constraint failed
        statusCode = 409
        errorCode = 'FOREIGN_KEY_CONSTRAINT'
        message = 'No se puede realizar la operación debido a dependencias con otros registros'
        details = err.meta
        break
      case 'P2025': // Record not found
        statusCode = 404
        errorCode = 'RECORD_NOT_FOUND'
        message = 'El registro solicitado no existe'
        break
      default:
        errorCode = `PRISMA_${err.code}`
        message = 'Error de base de datos'
    }
  } else if (err instanceof Error) {
    message = err.message
    if (err.name === 'ValidationError' || err.name === 'ValiError') {
      statusCode = 400
      status = 'fail'
      errorCode = (err as { code?: string }).code ?? 'VALIDATION_ERROR'
      isOperational = true
      
      // Extract details for Valibot errors if possible
      if ('issues' in err) {
        details = (err as { issues: unknown }).issues
      }
    }
  }

  // Log error (in production maybe use a more sophisticated logger)
  if (!isOperational || env.NODE_ENV === 'development') {
    console.error(`[ERROR][${errorCode}]`, err)
  }

  res.status(statusCode).json({
    status,
    message: statusCode === 500 && env.NODE_ENV === 'production' ? 'Error interno del servidor' : message,
    errorCode,
    details: details ?? undefined,
  })
}

