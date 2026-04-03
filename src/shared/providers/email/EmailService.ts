import { EmailFactory } from './EmailFactory.js';
import { IEmailStrategy, SendEmailOptions } from './IEmailStrategy.js';

export class EmailService {
  private strategy: IEmailStrategy;

  constructor() {
    this.strategy = EmailFactory.createStrategy();
  }

  /**
   * Envía un correo electrónico genérico.
   * @param options Objecto con opciones de envío (to, subject, body, from)
   */
  async send(options: SendEmailOptions): Promise<void> {
    await this.strategy.sendEmail(options);
  }

  /**
   * Método útil para notificaciones básicas
   */
  async sendNotification(to: string | string[], subject: string, message: string): Promise<void> {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Notificación</h2>
        <p>${message}</p>
        <hr />
        <p style="font-size: 12px; color: #888;">Este es un mensaje automático, por favor no responda.</p>
      </div>
    `;

    await this.send({
      to,
      subject,
      body: htmlBody,
    });
  }

  // Se pueden agregar más métodos para plantillas específicas:
  // async sendWelcomeEmail(to: string, userName: string) { ... }
  // async sendPasswordResetEmail(to: string, token: string) { ... }
}

export const emailService = new EmailService();
