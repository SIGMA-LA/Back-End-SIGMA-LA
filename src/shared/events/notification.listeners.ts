import { eventBus } from './eventBus.js';
import { emailService } from '../providers/email/index.js';
import { notificationConfigRepository, type ConfigRolesFields } from '../providers/email/NotificationConfigRepository.js';
import { prisma } from '../db/prismaClient.js';

export function setupNotificationListeners() {
  eventBus.on('visita.finalizada', async (visita) => {
    try {
      // Enviar a todos los usuarios de Coordinación con mail válido.
      const empleados = await prisma.empleado.findMany({
        where: {
          rol_actual: 'COORDINACION',
          activo: true,
          mail: { not: null }
        },
        select: { mail: true }
      });
      const emails = empleados.map(e => e.mail).filter((m): m is string => !!m);
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
        `- <b>Fecha:</b> ${visita.fecha_hora_visita ? visita.fecha_hora_visita.toLocaleString() : 'Pendiente de programación'}<br>` +
        `- <b>Observaciones finales:</b> ${visita.observaciones || 'Sin observaciones'}<br><br>` +
        `<i>Este es un aviso automático generado por el sistema SIGMA-LA para el personal de Coordinación. Por favor no responder a este correo.</i>`
      );
    } catch (err) {
      console.error('Error procesando evento visita.finalizada:', err);
    }
  });
  
  /*
  // Código anterior para notificaciones con configuración de role/field:
  const emails = await notificationConfigRepository.getEmailsForRoleNotification('COORDINACION', 'visita_completada');
  if (emails.length === 0) return;
  */

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
      // Enviar a todos los usuarios de Producción con mail válido.
      const empleados = await prisma.empleado.findMany({
        where: {
          rol_actual: 'PRODUCCION',
          activo: true,
          mail: { not: null }
        },
        select: { mail: true }
      });
      const emails = empleados.map(e => e.mail).filter((m): m is string => !!m);
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

  /*
  // Código anterior para notificaciones con configuración de role/field:
  const emails = await notificationConfigRepository.getEmailsForRoleNotification('PRODUCCION', 'orden_aprobada');
  if (emails.length === 0) return;
  */

  eventBus.on('visita.asignada', async ({ visita, cuils }) => {
    try {
      // Obtener emails de los empleados asignados que tengan mail
      const empleados = await prisma.empleado.findMany({
        where: {
          cuil: { in: cuils },
          activo: true,
          mail: { not: null }
        },
        select: { mail: true }
      });
      
      const emails = empleados.map(e => e.mail).filter((m): m is string => !!m);
      if (emails.length === 0) return;

      const clienteNombre = visita.nombre_cliente || visita.obra?.cliente?.nombre || 'Cliente';
      const direccion = visita.direccion_visita || visita.obra?.direccion || 'A coordinar';

      await emailService.sendNotification(
        emails,
        `Asignación de Visita Técnica - ${visita.motivo_visita}`,
        `Hola,<br><br>` +
        `Le informamos que ha sido asignado a una nueva visita técnica en el sistema.<br><br>` +
        `<b>Detalles de la operación:</b><br>` +
        `- <b>Cliente:</b> ${clienteNombre}<br>` +
        `- <b>Motivo:</b> ${visita.motivo_visita}<br>` +
        `- <b>Dirección:</b> ${direccion}<br>` +
        `- <b>Fecha Programada:</b> ${visita.fecha_hora_visita ? new Date(visita.fecha_hora_visita).toLocaleString() : 'Pendiente de programación'}<br>` +
        `- <b>Observaciones:</b> ${visita.observaciones || 'Ninguna'}<br><br>` +
        `<i>Este es un aviso automático generado por el sistema SIGMA-LA.</i>`
      );
    } catch (err) {
      console.error('Error procesando evento visita.asignada:', err);
    }
  });

  eventBus.on('visita.actualizada', async ({ visita, cuils, tipo }) => {
    try {
      // Obtener emails de los empleados asignados que tengan mail
      const empleados = await prisma.empleado.findMany({
        where: {
          cuil: { in: cuils },
          activo: true,
          mail: { not: null }
        },
        select: { mail: true }
      });
      
      const emailsVisitador = empleados.map(e => e.mail).filter((m): m is string => !!m);
      const emailsPlanta = await notificationConfigRepository.getEmailsForRoleNotification('PLANTA', 'actualizacion_visita', cuils);
      
      const allEmails = [...emailsVisitador, ...emailsPlanta];
      if (allEmails.length === 0) return;

      const clienteNombre = visita.nombre_cliente || visita.obra?.cliente?.nombre || 'Cliente';
      const direccion = visita.direccion_visita || visita.obra?.direccion || 'N/A';
      
      let titulo = '';
      let mensajeHtml = '';

      switch (tipo) {
        case 'CANCELADA':
          titulo = `Visita Técnica Cancelada - ${visita.motivo_visita}`;
          mensajeHtml = `Le informamos que la visita técnica programada para el <b>${visita.fecha_hora_visita ? new Date(visita.fecha_hora_visita).toLocaleString() : 'Sin fecha'}</b> ha sido <b>CANCELADA</b>.<br><br>` +
                        `<b>Detalles:</b><br>` +
                        `- <b>Cliente:</b> ${clienteNombre}<br>` +
                        `- <b>Observaciones:</b> ${visita.observaciones || 'Ninguna'}`;
          break;
        case 'HORARIO_MODIFICADO':
          titulo = `Horario Modificado - Visita Técnica - ${visita.motivo_visita}`;
          mensajeHtml = `Le informamos que los horarios de su visita técnica asignada han sido <b>MODIFICADOS</b>.<br><br>` +
                        `<b>Nuevos Detalles:</b><br>` +
                        `- <b>Nueva Fecha/Hora:</b> ${visita.fecha_hora_visita ? new Date(visita.fecha_hora_visita).toLocaleString() : 'Pendiente'}<br>` +
                        `- <b>Cliente:</b> ${clienteNombre}<br>` +
                        `- <b>Dirección:</b> ${direccion}`;
          break;
        case 'DESASIGNADO':
          titulo = `Desasignación de Visita Técnica - ${visita.motivo_visita}`;
          mensajeHtml = `Le informamos que ha sido <b>REMOVIDO</b> de la asignación para la siguiente visita técnica.<br><br>` +
                        `<b>Detalles de la visita original:</b><br>` +
                        `- <b>Fecha/Hora:</b> ${visita.fecha_hora_visita ? new Date(visita.fecha_hora_visita).toLocaleString() : 'N/A'}<br>` +
                        `- <b>Cliente:</b> ${clienteNombre}`;
          break;
      }

      await emailService.sendNotification(
        allEmails,
        titulo,
        `Hola,<br><br>` +
        `${mensajeHtml}<br><br>` +
        `<i>Este es un aviso automático generado por el sistema SIGMA-LA.</i>`
      );
    } catch (err) {
      console.error('Error procesando evento visita.actualizada:', err);
    }
  });

  eventBus.on('entrega.asignada', async ({ entrega, cuils }) => {
    try {
      const emails = await notificationConfigRepository.getEmailsForRoleNotification('PLANTA', 'asignacion_entrega', cuils);
      if (emails.length === 0) return;

      const clienteNombre = entrega.obra?.cliente?.nombre || 'Cliente';
      const direccion = entrega.obra?.direccion || 'A coordinar';

      await emailService.sendNotification(
        emails,
        `Asignación de Entrega - Obra #${entrega.cod_obra}`,
        `Hola,<br><br>` +
        `Le informamos que ha sido asignado a una nueva entrega en el sistema.<br><br>` +
        `<b>Detalles de la operación:</b><br>` +
        `- <b>Cliente:</b> ${clienteNombre}<br>` +
        `- <b>Obra:</b> #${entrega.cod_obra}<br>` +
        `- <b>Dirección:</b> ${direccion}<br>` +
        `- <b>Fecha Entrega:</b> ${new Date(entrega.fecha_hora_entrega).toLocaleString()}<br>` +
        `- <b>Detalle:</b> ${entrega.detalle}<br><br>` +
        `<i>Este es un aviso automático generado por el sistema SIGMA-LA.</i>`
      );
    } catch (err) {
      console.error('Error procesando evento entrega.asignada:', err);
    }
  });

  eventBus.on('entrega.actualizada', async ({ entrega, cuils, tipo }) => {
    try {
      const emails = await notificationConfigRepository.getEmailsForRoleNotification('PLANTA', 'actualizacion_visita', cuils);
      if (emails.length === 0) return;

      const clienteNombre = entrega.obra?.cliente?.nombre || 'Cliente';
      
      let titulo = '';
      let mensajeHtml = '';

      switch (tipo) {
        case 'CANCELADA':
          titulo = `Entrega Cancelada - Obra #${entrega.cod_obra}`;
          mensajeHtml = `Le informamos que la entrega programada para el <b>${new Date(entrega.fecha_hora_entrega).toLocaleString()}</b> ha sido <b>CANCELADA</b>.<br><br>` +
                        `<b>Detalles:</b><br>` +
                        `- <b>Obra:</b> #${entrega.cod_obra}<br>` +
                        `- <b>Observaciones:</b> ${entrega.observaciones || 'Ninguna'}`;
          break;
        case 'HORARIO_MODIFICADO':
          titulo = `Horario Modificado - Entrega - Obra #${entrega.cod_obra}`;
          mensajeHtml = `Le informamos que los horarios de su entrega asignada han sido <b>MODIFICADOS</b>.<br><br>` +
                        `<b>Nuevos Detalles:</b><br>` +
                        `- <b>Nueva Fecha/Hora:</b> ${new Date(entrega.fecha_hora_entrega).toLocaleString()}<br>` +
                        `- <b>Cliente:</b> ${clienteNombre}`;
          break;
        case 'DESASIGNADO':
          titulo = `Desasignación de Entrega - Obra #${entrega.cod_obra}`;
          mensajeHtml = `Le informamos que ha sido <b>REMOVIDO</b> de la asignación para la siguiente entrega.<br><br>` +
                        `<b>Detalles de la entrega original:</b><br>` +
                        `- <b>Fecha/Hora:</b> ${new Date(entrega.fecha_hora_entrega).toLocaleString()}<br>` +
                        `- <b>Obra:</b> #${entrega.cod_obra}`;
          break;
      }

      await emailService.sendNotification(
        emails,
        titulo,
        `Hola,<br><br>` +
        `${mensajeHtml}<br><br>` +
        `<i>Este es un aviso automático generado por el sistema SIGMA-LA.</i>`
      );
    } catch (err) {
      console.error('Error procesando evento entrega.actualizada:', err);
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

  eventBus.on('obra.cambio_estado', async ({ cod_obra, nuevo_estado }) => {
    try {
      // 1. Notificar a COORDINACION
      let emailsCoordinacion: string[] = [];
      if (nuevo_estado === 'EN PRODUCCION' || nuevo_estado === 'PRODUCCION FINALIZADA') {
        const empleadosCoordinacion = await prisma.empleado.findMany({
          where: {
            rol_actual: 'COORDINACION',
            activo: true,
            mail: { not: null }
          },
          select: { mail: true }
        });
        emailsCoordinacion = empleadosCoordinacion.map(e => e.mail).filter((m): m is string => !!m);
      } else {
        // Para otros estados se mantiene la lógica previa basada en configuraciones.
        emailsCoordinacion = await notificationConfigRepository.getEmailsForRoleNotification('COORDINACION', 'cambio_estado');
      }

      if (emailsCoordinacion.length > 0) {
        await emailService.sendNotification(
          emailsCoordinacion,
          `Aviso Interno: Cambio de Estado - Obra #${cod_obra}`,
          `Hola equipo de Coordinación,<br><br>` +
          `Les informamos que la obra ha cambiado de estado en el sistema.<br><br>` +
          `<b>Detalles:</b><br>` +
          `- <b>Cód. Obra ASOC:</b> #${cod_obra}<br>` +
          `- <b>Nuevo Estado:</b> <b>${nuevo_estado}</b><br><br>` +
          `<i>Este es un aviso automático generado por el sistema SIGMA-LA.</i>`
        );
      }

      /*
      // Código anterior para notificaciones con configuración de role/field:
      const emailsCoordinacion = await notificationConfigRepository.getEmailsForRoleNotification('COORDINACION', 'cambio_estado');
      if (emailsCoordinacion.length > 0) {
        await emailService.sendNotification(...)
      }
      */

      // 2. Notificar a VENTAS según el nuevo estado
      let campoVentas: ConfigRolesFields['VENTAS'] | null = null;
      
      switch (nuevo_estado) {
        case 'EN PRODUCCION':
          campoVentas = 'obra_produccion';
          break;
        case 'EN ESPERA DE STOCK':
          campoVentas = 'obra_pedido_stock';
          break;
        case 'PRODUCCION FINALIZADA':
          campoVentas = 'obra_produccion_final';
          break;
        case 'ENTREGADA':
          campoVentas = 'obra_entregada';
          break;
      }

      if (campoVentas) {
        const emailsVentas = await notificationConfigRepository.getEmailsForRoleNotification('VENTAS', campoVentas);
        if (emailsVentas.length > 0) {
          await emailService.sendNotification(
            emailsVentas,
            `Aviso Interno: Estado de Obra Actualizado - Obra #${cod_obra}`,
            `Hola equipo de Ventas,<br><br>` +
            `Les informamos que una obra de su interés ha avanzado de estado.<br><br>` +
            `<b>Detalles de la obra:</b><br>` +
            `- <b>Cód. Obra ASOC:</b> #${cod_obra}<br>` +
            `- <b>Nuevo Estado:</b> <b>${nuevo_estado}</b><br><br>` +
            `<i>Este es un aviso automático generado por el sistema SIGMA-LA. Por favor revisar el módulo de obras para más detalles.</i>`
          );
        }
      }

    } catch (err) {
      console.error('Error procesando evento obra.cambio_estado:', err);
    }
  });
}
