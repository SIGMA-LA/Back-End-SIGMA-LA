import { eventBus } from './eventBus.js';
import { emailService } from '../providers/email/index.js';
import { notificationConfigRepository } from '../providers/email/NotificationConfigRepository.js';

export function setupNotificationListeners() {
  eventBus.on('visita.finalizada', async (visita) => {
    try {
      const emails = await notificationConfigRepository.getEmailsForRoleNotification('COORDINACION', 'visita_completada');
      if (emails.length === 0) return;

      const clienteNombre = visita.nombre_cliente || visita.obra?.cliente?.nombre || 'Cliente';
      
      await emailService.sendNotification(
        emails,
        `Aviso Interno: Visita Técnica Finalizada - ${visita.motivo_visita}`,
        `Hola equipo de Coordinación,<br><br>` +
        `Les informamos que se ha marcado como FINALIZADA una visita técnica en el sistema.<br><br>` +
        `<b>Detalles de la operación:</b><br>` +
        `- <b>Cliente:</b> ${clienteNombre}<br>` +
        `- <b>Motivo:</b> ${visita.motivo_visita}<br>` +
        `- <b>Fecha:</b> ${visita.fecha_hora_visita.toLocaleString()}<br>` +
        `- <b>Observaciones finales:</b> ${visita.observaciones || 'Sin observaciones'}<br><br>` +
        `<i>Este es un aviso automático generado por el sistema SIGMA-LA para el personal de Coordinación. Por favor no responder a este correo.</i>`
      );
    } catch (err) {
      console.error('Error procesando evento visita.finalizada:', err);
    }
  });

  eventBus.on('orden_produccion.creada', async (orden) => {
    try {
      const emails = await notificationConfigRepository.getEmailsForRoleNotification('COORDINACION', 'nueva_orden_produccion');
      if (emails.length === 0) return;

      await emailService.sendNotification(
        emails,
        `Aviso Interno: Nueva Orden de Producción - Obra #${orden.cod_obra}`,
        `Hola equipo de Coordinación,<br><br>` +
        `Les informamos que se ha generado una <b>Nueva Orden de Producción</b> en el sistema.<br><br>` +
        `<b>Detalles de la operación:</b><br>` +
        `- <b>ID Operación:</b> #${orden.cod_op}<br>` +
        `- <b>Cód. Obra ASOC:</b> #${orden.cod_obra}<br>` +
        `- <b>Fecha Gen:</b> ${new Date(orden.fecha_confeccion).toLocaleDateString()}<br><br>` +
        `<i>Este es un aviso automático generado por el sistema SIGMA-LA para el personal de Coordinación. Por favor no responder a este correo.</i>`
      );
    } catch (err) {
      console.error('Error procesando evento orden_produccion.creada:', err);
    }
  });
}
