import { BaseSchema, safeParse, BaseIssue, IssuePathItem } from 'valibot'
import { Request, Response, NextFunction } from 'express'

interface ValidationError {
  location: 'body' | 'params' | 'query'
  issues: Array<{
    path: string
    message: string
    received: unknown
  }>
}

type SchemaType = {
  body?: BaseSchema<unknown, unknown, BaseIssue<unknown>>
  params?: BaseSchema<unknown, unknown, BaseIssue<unknown>>
  query?: BaseSchema<unknown, unknown, BaseIssue<unknown>>
}

export const validate = (schemas: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = []

    // Validar body si existe
    if (schemas.body) {
      const result = safeParse(schemas.body, req.body)
      if (!result.success) {
        errors.push({
          location: 'body',
          issues: result.issues.map(issue => ({
            path:
              issue.path
                ?.map((pathItem: IssuePathItem) => String(pathItem.key))
                .join('.') || 'root',
            message: issue.message,
            received: issue.input,
          })),
        })
      } else {
        req.body = result.output
      }
    }

    // Validar params si existe
    if (schemas.params) {
      const result = safeParse(schemas.params, req.params)
      if (!result.success) {
        errors.push({
          location: 'params',
          issues: result.issues.map(issue => ({
            path:
              issue.path
                ?.map((pathItem: IssuePathItem) => String(pathItem.key))
                .join('.') || 'root',
            message: issue.message,
            received: issue.input,
          })),
        })
      } else {
        req.params = result.output as Record<string, string>
      }
    }

    // Validar query si existe
    if (schemas.query) {
      const result = safeParse(schemas.query, req.query)
      if (!result.success) {
        errors.push({
          location: 'query',
          issues: result.issues.map(issue => ({
            path:
              issue.path
                ?.map((pathItem: IssuePathItem) => String(pathItem.key))
                .join('.') || 'root',
            message: issue.message,
            received: issue.input,
          })),
        })
      } else {
        req.query = result.output as Record<string, string | string[]>
      }
    }

    // Si hay errores, retornar respuesta de error
    if (errors.length > 0) {
      console.error('[VALIDATION_ERROR]', JSON.stringify(errors, null, 2))
      res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        details: errors,
      })
      return
    }

    // Si todo está bien, continuar
    next()
  }
}
