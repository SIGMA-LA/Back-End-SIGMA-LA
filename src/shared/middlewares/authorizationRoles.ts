import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/AppError.js'

export const ROLES = [
  'ADMIN',
  'COORDINACION',
  'VENTAS',
  'PRODUCCION',
  'VISITADOR',
  'PLANTA',
] as const

export type UserRole = (typeof ROLES)[number]

export const PERMISSIONS = {
  obra: {
    statsAdmin: ['ADMIN'],
    statsVentas: ['ADMIN', 'VENTAS'],
    statsCoordinacion: ['ADMIN', 'COORDINACION'],
    verParaEntrega: ['ADMIN', 'COORDINACION'],
    verParaPedidoStock: ['ADMIN', 'COORDINACION'],
    verNotasFabrica: ['ADMIN', 'COORDINACION', 'PRODUCCION'],
    verConPresupuestoAceptado: ['ADMIN', 'VENTAS'],
    solicitarStock: ['ADMIN', 'COORDINACION'],
    recibirStock: ['ADMIN', 'PRODUCCION'],
    finalizarProduccion: ['ADMIN', 'PRODUCCION'],
    gestionarNotaFabrica: ['ADMIN', 'COORDINACION', 'PRODUCCION'],
    crear: ['ADMIN', 'VENTAS'],
    actualizar: ['ADMIN', 'VENTAS'],
    eliminar: ['ADMIN'],
  },
  empleado: {
    crear: ['ADMIN'],
    actualizar: ['ADMIN'],
    eliminar: ['ADMIN'],
  },
  pago: {
    crear: ['ADMIN', 'VENTAS'],
    actualizar: ['ADMIN', 'VENTAS'],
    eliminar: ['ADMIN', 'VENTAS'],
    obtener: ['ADMIN', 'VENTAS']
  }
} as const satisfies Record<string, Record<string, readonly UserRole[]>>

export type PermissionResource = keyof typeof PERMISSIONS

const normalizeRole = (role?: string) => role?.toUpperCase() ?? ''

const buildEndpointLabel = (req: Request) => {
  return `${req.method} ${req.baseUrl}${req.path}`.trim()
}

export function authorizeRoles(roles: readonly string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = normalizeRole(req.user?.rol_actual)
    const normalizedRoles = roles.map(role => normalizeRole(role))

    if (!req.user || !userRole || !normalizedRoles.includes(userRole)) {
      const requiredRoles = normalizedRoles.join(', ')
      throw new AppError(
        `No autorizado para ${buildEndpointLabel(req)}. Roles permitidos: [${requiredRoles}]`,
        403,
        'FORBIDDEN',
      )
    }

    next()
  }
}

export function authorize<R extends PermissionResource>(
  resource: R,
  action: keyof (typeof PERMISSIONS)[R],
) {
  const allowedRoles = PERMISSIONS[resource][action] as readonly UserRole[]
  return authorizeRoles(allowedRoles)
}
