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
const ADMIN_ROLE: UserRole = 'ADMIN'

export const PERMISSIONS = {
  obra: {
    statsAdmin: [],
    statsVentas: ['VENTAS'],
    statsCoordinacion: ['COORDINACION'],
    verParaEntrega: ['COORDINACION'],
    verParaPedidoStock: ['COORDINACION'],
    verNotasFabrica: ['COORDINACION', 'PRODUCCION'],
    verConPresupuestoAceptado: ['VENTAS'],
    solicitarStock: ['COORDINACION'],
    recibirStock: ['PRODUCCION'],
    finalizarProduccion: ['PRODUCCION'],
    gestionarNotaFabrica: ['COORDINACION', 'PRODUCCION', 'VENTAS'],
    crear: ['VENTAS'],
    actualizar: ['VENTAS'],
    eliminar: ['VENTAS'],
  },
  empleado: {
    crear: [],
    actualizar: [],
    eliminar: [],
  },
  pago: {
    crear: ['VENTAS'],
    actualizar: ['VENTAS'],
    eliminar: ['VENTAS'],
    obtener: ['VENTAS'],
    facturacion: [],
  },
  vehiculo: {
    crear: ['COORDINACION'],
    actualizar: ['COORDINACION'],
    eliminar: ['COORDINACION'],
    obtener: ['COORDINACION'],
  },
  visita: {
    crear: ['COORDINACION'],
    actualizar: ['COORDINACION'],
    eliminar: ['COORDINACION'],
    cancelar: ['COORDINACION', 'VISITADOR', 'PLANTA'],
    finalizar: ['COORDINACION', 'VISITADOR'],
  },
  entrega: {
    crear: ['COORDINACION'],
    actualizar: ['COORDINACION'],
    eliminar: ['COORDINACION'],
    finalizar: ['COORDINACION'],
    cancelar: ['COORDINACION', 'VISITADOR', 'PLANTA'],
    gestionarOrdenes: ['COORDINACION'],
  },
  OP: {
    crear: ['PRODUCCION'],
    actualizar: ['PRODUCCION', 'COORDINACION'],
    eliminar: ['PRODUCCION'],
  },
  parametro: {
    actualizar: ['COORDINACION'],
  },
  cliente : {
    crear: ['VENTAS'],
    actualizar: ['VENTAS'],
    eliminar: ['VENTAS'],
    obtener: ['VENTAS', 'COORDINACION'],
  },
  presupuesto: {
    crear: ['VENTAS'],
    actualizar: ['VENTAS'],
    eliminar: ['VENTAS'],
    obtener: ['VENTAS', 'COORDINACION'],
  },
  maquinaria: {
    crear: ['COORDINACION'],
    actualizar: ['COORDINACION'],
    eliminar: ['COORDINACION'],
  },
  entregaEmpleado: {
    crear: ['COORDINACION'],
    actualizar: ['COORDINACION'],
    eliminar: ['COORDINACION'],
  },
  visitaEmpleado: {
    crear: ['COORDINACION'],
    actualizar: ['COORDINACION'],
    eliminar: ['COORDINACION'],
  },
  usoVehiculoEntrega: {
    crear: ['COORDINACION'],
    actualizar: ['COORDINACION'],
    eliminar: ['COORDINACION'],
  },
  usoVehiculoVisita: {
    crear: ['COORDINACION'],
    actualizar: ['COORDINACION'],
    eliminar: ['COORDINACION'],
  },
  usoMaquinaria: {
    crear: ['COORDINACION'],
    actualizar: ['COORDINACION'],
    eliminar: ['COORDINACION'],
  },
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
    // Asegura que ADMIN siempre tenga acceso a todos los endpoints, incluso si no se especifica explícitamente
    const allowedRoles = Array.from(new Set([ADMIN_ROLE, ...normalizedRoles]))

    if (!req.user || !userRole || !allowedRoles.includes(userRole)) {
      const requiredRoles = allowedRoles.join(', ')
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
