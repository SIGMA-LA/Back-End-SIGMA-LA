import { AppError } from './AppError.js'

/**
 * Error de validación personalizado que el errorHandler reconoce para devolver 400.
 */
export class ValidationError extends AppError {
  constructor(message: string, errorCode: string = 'VALIDATION_ERROR', details?: unknown) {
    super(message, 400, errorCode, true, details)
    this.name = 'ValidationError'
  }
}

