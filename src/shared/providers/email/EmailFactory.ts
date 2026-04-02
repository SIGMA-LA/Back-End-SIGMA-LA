import { env } from '../../../config/env.js';
import { IEmailStrategy } from './IEmailStrategy.js';
import { NodemailerStrategy } from './NodemailerStrategy.js';
import { ExternalEmailStrategy } from './ExternalEmailStrategy.js';

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
