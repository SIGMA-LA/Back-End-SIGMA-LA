import { PrismaClient } from '@prisma/client'
import { prisma } from '../../db/prismaClient.js'

export type ConfigRolesFields = {
  COORDINACION: 'visita_completada' | 'nueva_orden_produccion';
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

    let configs: any[] = [];

    // Lógica específica por rol (expandible)
    if (rol === 'COORDINACION') {
      configs = await this.prisma.config_coordinacion.findMany({
        where: {
          [field as string]: true,
          empleado: baseWhere
        },
        select: { empleado: { select: { mail: true } } }
      });
    }

    /* 
    // Ejemplo para otros roles futuros:
    if (rol === 'ADMINISTRACION') {
       configs = await this.prisma.config_administracion.findMany({ ... });
    }
    */

    return configs
      .map(c => c.empleado?.mail)
      .filter((mail): mail is string => !!mail);
  }
}

export const notificationConfigRepository = new NotificationConfigRepository();
