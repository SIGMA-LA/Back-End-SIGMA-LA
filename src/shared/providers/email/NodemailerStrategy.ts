import nodemailer from 'nodemailer';
import { env } from '../../../config/env';
import { IEmailStrategy, SendEmailOptions } from './IEmailStrategy';

export class NodemailerStrategy implements IEmailStrategy {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.ethereal.email',
      port: env.SMTP_PORT || 587,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: options.from || env.MAIL_FROM || '"Notificaciones" <no-reply@localhost>',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.body,
      });

      console.log('Mensaje enviado (Nodemailer): %s', info.messageId);
      
      // Útil para desarrollo usando Ethereal (opcional)
      // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('Error al enviar correo con Nodemailer:', error);
      throw new Error('No se pudo enviar el correo vía Nodemailer');
    }
  }
}
