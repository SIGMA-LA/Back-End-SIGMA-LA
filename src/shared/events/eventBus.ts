import { EventEmitter } from 'events';
import { orden_de_produccion } from '@prisma/client';
import { VisitaWithRelations } from '../../models/Visita/visita.repository.js';

export interface AppEvents {
  'visita.finalizada': (visita: VisitaWithRelations) => void | Promise<void>;
  'orden_produccion.creada': (orden: orden_de_produccion) => void | Promise<void>;
}

class TypedEventEmitter extends EventEmitter {
  on<K extends keyof AppEvents>(eventName: K, listener: AppEvents[K]): this {
    return super.on(eventName, listener as any);
  }

  emit<K extends keyof AppEvents>(eventName: K, ...args: Parameters<AppEvents[K]>): boolean {
    return super.emit(eventName, ...args);
  }
}

export const eventBus = new TypedEventEmitter();
