/**
 * Error de validación personalizado que el errorHandler reconoce para devolver 400.
 */
export class ValidationError extends Error {
  public status: number
  public code: string

  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message)
    this.name = 'ValidationError'
    this.status = 400
    this.code = code
    // Asegurar que el stack trace sea correcto en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError)
    }
  }
}
