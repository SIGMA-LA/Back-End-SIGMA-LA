import { PrismaClient } from '@prisma/client'
import { prisma } from '../../db/prismaClient.js'

export type ConfigRolesFields = {
  COORDINACION: 'visita_completada' | 'nueva_orden_produccion' | 'cambio_estado' | 'pago_completo_obra';
  PRODUCCION: 'orden_aprobada';
  VISITADOR: 'asignacion_visita' | 'actualizacion_visita';
  // Agregar otros roles y sus campos de notificación aquí en el futuro
  // ADMINISTRACION: 'pago_recibido' | 'nueva_obra'; 
};

export class NotificationConfigRepository {
  private prisma: PrismaClient
  
  constructor() {
    this.prisma = prisma
  }

  /**
   * Obtiene emails de empleados filtrados por rol y su preferencia de notificación específica.
   * Centraliza la lógica de "quién quiere recibir qué" según su rol.
   */
  async getEmailsForRoleNotification<R extends keyof ConfigRolesFields>(
    rol: R, 
    field: ConfigRolesFields[R]
  ): Promise<string[]> {
    
    // Filtro base para cualquier rol: Activo y con mail
    const baseWhere = {
      rol_actual: rol,
      activo: true,
      mail: { not: null },
      notificacion_email: true
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
      const configs = await (this.prisma as any).config_produccion.findMany({
        where: {
          [field as string]: true,
          empleado: baseWhere
        },
        select: { empleado: { select: { mail: true } } }
      });
      emails = configs.map((c: any) => c.empleado.mail).filter((m: any): m is string => !!m);
    }

    if (rol === 'VISITADOR') {
      const configs = await (this.prisma as any).config_visitador.findMany({
        where: {
          [field as string]: true,
          empleado: baseWhere
        },
        select: { empleado: { select: { mail: true } } }
      });
      emails = configs.map((c: any) => c.empleado.mail).filter((m: any): m is string => !!m);
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
