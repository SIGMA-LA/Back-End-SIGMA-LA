import { PrismaClient, Prisma } from '@prisma/client'
import { prisma } from '../../db/prismaClient.js'

export type ConfigRolesFields = {
  COORDINACION: 'visita_completada' | 'nueva_orden_produccion' | 'cambio_estado' | 'pago_completo_obra';
  PRODUCCION: 'orden_aprobada';
  VISITADOR: 'asignacion_visita' | 'actualizacion_visita';
  PLANTA: 'asignacion_visita' | 'asignacion_entrega' | 'actualizacion_visita';
  VENTAS: 'obra_produccion' | 'obra_pedido_stock' | 'obra_produccion_final' | 'obra_entregada';
  // Agregar otros roles y sus campos de notificación aquí en el futuro
  // ADMINISTRACION: 'pago_recibido' | 'nueva_obra'; 
};

/** Shape returned by config_X.findMany when selecting empleado.mail */
interface ConfigWithEmpleadoMail {
  empleado: {
    mail: string | null
  }
}

/** Extended Prisma client that exposes the config tables not yet in the generated types */
type PrismaClientExtended = PrismaClient & {
  config_produccion: { findMany(args: object): Promise<ConfigWithEmpleadoMail[]> }
  config_visitador:  { findMany(args: object): Promise<ConfigWithEmpleadoMail[]> }
  config_planta:     { findMany(args: object): Promise<ConfigWithEmpleadoMail[]> }
  config_ventas:     { findMany(args: object): Promise<ConfigWithEmpleadoMail[]> }
}

export class NotificationConfigRepository {
  private prisma: PrismaClientExtended
  
  constructor() {
    this.prisma = prisma as unknown as PrismaClientExtended
  }

  /**
   * Obtiene emails de empleados filtrados por rol y su preferencia de notificación específica.
   * Centraliza la lógica de "quién quiere recibir qué" según su rol.
   */
  async getEmailsForRoleNotification<R extends keyof ConfigRolesFields>(
    rol: R, 
    field: ConfigRolesFields[R],
    cuils?: string[]
  ): Promise<string[]> {
    
    // Filtro base para cualquier rol: Activo y con mail
    const baseWhere: Prisma.empleadoWhereInput = {
      rol_actual: rol,
      activo: true,
      mail: { not: null },
      notificacion_email: true,
      ...(cuils && cuils.length > 0 ? { cuil: { in: cuils } } : {})
    };

    let emails: string[] = [];
    
    // Lógica específica por rol (expandible)
    if (rol === 'COORDINACION') {
      const configs = await this.prisma.config_coordinacion.findMany({
        where: {
          [field as string]: true,
          empleado: baseWhere
        },
        select: { empleado: { select: { mail: true } } }
      });
      emails = configs.map(c => c.empleado.mail).filter((m): m is string => !!m);
    }

    if (rol === 'PRODUCCION') {
      const configs = await this.prisma.config_produccion.findMany({
        where: {
          [field as string]: true,
          empleado: baseWhere
        },
        select: { empleado: { select: { mail: true } } }
      });
      emails = configs.map((c: ConfigWithEmpleadoMail) => c.empleado.mail).filter((m): m is string => !!m);
    }

    if (rol === 'VISITADOR') {
      const configs = await this.prisma.config_visitador.findMany({
        where: {
          [field as string]: true,
          empleado: baseWhere
        },
        select: { empleado: { select: { mail: true } } }
      });
      emails = configs.map((c: ConfigWithEmpleadoMail) => c.empleado.mail).filter((m): m is string => !!m);
    }

    if (rol === 'PLANTA') {
      const configs = await this.prisma.config_planta.findMany({
        where: {
          [field as string]: true,
          empleado: baseWhere
        },
        select: { empleado: { select: { mail: true } } }
      });
      emails = configs.map((c: ConfigWithEmpleadoMail) => c.empleado.mail).filter((m): m is string => !!m);
    }

    if (rol === 'VENTAS') {
      const configs = await this.prisma.config_ventas.findMany({
        where: {
          [field as string]: true,
          empleado: baseWhere
        },
        select: { empleado: { select: { mail: true } } }
      });
      emails = configs.map((c: ConfigWithEmpleadoMail) => c.empleado.mail).filter((m): m is string => !!m);
    }

    /* 
    // Ejemplo para otros roles futuros:
    if (rol === 'ADMINISTRACION') {
       configs = await this.prisma.config_administracion.findMany({ ... });
    }
    */

    return emails;
  }
}

export const notificationConfigRepository = new NotificationConfigRepository();
