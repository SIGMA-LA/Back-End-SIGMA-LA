import { EventEmitter } from 'events';
import { orden_de_produccion } from '@prisma/client';
import { VisitaWithRelations } from '../../models/Visita/visita.repository.js';

export interface AppEvents {
  'visita.finalizada': (visita: VisitaWithRelations) => void | Promise<void>;
  'orden_produccion.creada': (orden: orden_de_produccion) => void | Promise<void>;
  'orden_produccion.aprobada': (orden: orden_de_produccion) => void | Promise<void>;
  'obra.pagada_totalmente': (data: { cod_obra: number }) => void | Promise<void>;
  'visita.asignada': (data: { visita: VisitaWithRelations, cuils: string[] }) => void | Promise<void>;
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
