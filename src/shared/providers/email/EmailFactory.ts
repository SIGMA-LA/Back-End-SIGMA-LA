import { env } from '../../../config/env';
import { IEmailStrategy } from './IEmailStrategy';
import { NodemailerStrategy } from './NodemailerStrategy';
import { ExternalEmailStrategy } from './ExternalEmailStrategy';

export class EmailFactory {
  static createStrategy(): IEmailStrategy {
    // Retorna la estrategia en función del entorno
    if (env.NODE_ENV === 'production') {
      return new ExternalEmailStrategy();
    }
    
    // Por defecto en desarrollo (o testing) devolvemos Nodemailer
    return new NodemailerStrategy();
  }
}
