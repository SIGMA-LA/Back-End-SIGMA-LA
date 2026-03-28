import { env } from '../../../config/env';
import { IEmailStrategy, SendEmailOptions } from './IEmailStrategy';

export class ExternalEmailStrategy implements IEmailStrategy {
  constructor() {
    // Aquí puedes inicializar el cliente del servicio externo, 
    // por ejemplo Resend, SendGrid, Mailjet o AWS SES.
    // ej. this.client = new Resend(env.RESEND_API_KEY);
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      /* 
      // Ejemplo pseudo-código:
      await this.client.emails.send({
        from: options.from || env.MAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.body,
      });
      */
      console.log(`[Producción] Enviando correo simulado vía Servicio Externo a: ${options.to}`);
    } catch (error) {
      console.error('Error al enviar correo vía Servicio Externo:', error);
      throw new Error('No se pudo enviar el correo vía Servicio Externo');
    }
  }
}
