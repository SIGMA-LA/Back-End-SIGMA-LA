import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { env } from '../../config/env.js'
import { AppError } from '../../shared/errors/AppError.js'

/**
 * Middleware para verificar autenticación por JWT.
 * Busca el token primero en la cookie 'accessToken' y luego en el header Authorization.
 * Agrega req.user con cuil y rol_actual si el token es válido.
 * @param {Request} req - Objeto de solicitud de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @param {NextFunction} next - Función para pasar al siguiente middleware
 */
export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Busca el token en la cookie 'accessToken' o en el header Authorization
  const authHeader = req.headers['authorization']
  const token =
    req.cookies?.accessToken || (authHeader && authHeader.split(' ')[1])

  if (!token) {
    throw new AppError('Token no proporcionado', 401, 'TOKEN_REQUIRED')
  }
  try {
    const user = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = user
    next()
  } catch {
    throw new AppError('Token inválido', 403, 'INVALID_TOKEN')
  }
}
