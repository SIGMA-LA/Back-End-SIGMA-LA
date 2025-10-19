import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_default_secret'

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
    return res.status(401).json({ error: 'Token no proporcionado' })
  }
  try {
    const user = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = user
    next()
  } catch {
    return res.status(403).json({ error: 'Token inválido' })
  }
}

/**
 * Middleware para autorización por rol.
 * Permite acceso solo si el usuario tiene el rol requerido.
 * @param {string[]} roles - Roles permitidos
 * @returns {Function} Middleware de autorización
 */
export function authorizeRoles(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-expect-error: req.user no está tipado en Express por defecto
    if (!req.user || !roles.includes(req.user.rol_actual)) {
      return res.status(403).json({ error: 'No autorizado' })
    }
    next()
  }
}
