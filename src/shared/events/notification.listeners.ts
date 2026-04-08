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

  eventBus.on('orden_produccion.aprobada', async (orden) => {
    try {
      const emails = await notificationConfigRepository.getEmailsForRoleNotification('PRODUCCION', 'orden_aprobada');
      if (emails.length === 0) return;

      await emailService.sendNotification(
        emails,
        `Aviso Interno: Orden de Producción Aprobada - Operación #${orden.cod_op}`,
        `Hola equipo de Producción,<br><br>` +
        `Les informamos que la <b>Orden de Producción #${orden.cod_op}</b> ha sido <b>APROBADA</b> y está lista para que inicien la producción.<br><br>` +
        `<b>Detalles de la operación:</b><br>` +
        `- <b>ID Operación:</b> #${orden.cod_op}<br>` +
        `- <b>Cód. Obra ASOC:</b> #${orden.cod_obra}<br>` +
        `- <b>Fecha Validación:</b> ${orden.fecha_validacion ? new Date(orden.fecha_validacion).toLocaleDateString() : 'N/A'}<br><br>` +
        `<i>Este es un aviso automático generado por el sistema SIGMA-LA para el personal de Producción. Por favor no responder a este correo.</i>`
      );
    } catch (err) {
      console.error('Error procesando evento orden_produccion.aprobada:', err);
    }
  });

  eventBus.on('visita.asignada', async ({ visita, cuils }) => {
    try {
      const emails = await notificationConfigRepository.getEmailsForRoleNotification('VISITADOR', 'asignacion_visita', cuils);
      if (emails.length === 0) return;

      const clienteNombre = visita.nombre_cliente || visita.obra?.cliente?.nombre || 'Cliente';
      const direccion = visita.direccion_visita || visita.obra?.direccion || 'A coordinar';

      await emailService.sendNotification(
        emails,
        `Asignación de Visita Técnica - ${visita.motivo_visita}`,
        `Hola Visitador,<br><br>` +
        `Le informamos que ha sido asignado a una nueva visita técnica en el sistema.<br><br>` +
        `<b>Detalles de la operación:</b><br>` +
        `- <b>Cliente:</b> ${clienteNombre}<br>` +
        `- <b>Motivo:</b> ${visita.motivo_visita}<br>` +
        `- <b>Dirección:</b> ${direccion}<br>` +
        `- <b>Fecha Programada:</b> ${new Date(visita.fecha_hora_visita).toLocaleString()}<br>` +
        `- <b>Observaciones:</b> ${visita.observaciones || 'Ninguna'}<br><br>` +
        `<i>Este es un aviso automático generado por el sistema SIGMA-LA.</i>`
      );
    } catch (err) {
      console.error('Error procesando evento visita.asignada:', err);
    }
  });

  eventBus.on('obra.pagada_totalmente', async ({ cod_obra }) => {
    try {
      const emails = await notificationConfigRepository.getEmailsForRoleNotification('COORDINACION', 'pago_completo_obra');
      if (emails.length === 0) return;

      await emailService.sendNotification(
        emails,
        `Aviso Interno: Pago Completo Recibido - Obra #${cod_obra}`,
        `Hola equipo de Coordinación,<br><br>` +
        `Les informamos que se ha registrado el pago final y la obra se encuentra <b>TOTALMENTE PAGADA</b> en el sistema.<br><br>` +
        `<b>Detalles de la operación:</b><br>` +
        `- <b>Cód. Obra ASOC:</b> #${cod_obra}<br>` +
        `- <b>Estado Actualizado:</b> PAGADA TOTALMENTE<br><br>` +
        `<i>Este es un aviso automático generado por el sistema SIGMA-LA para el personal de Coordinación. Por favor no responder a este correo.</i>`
      );
    } catch (err) {
      console.error('Error procesando evento obra.pagada_totalmente:', err);
    }
  });
}
