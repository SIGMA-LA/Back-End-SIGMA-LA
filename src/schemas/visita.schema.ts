import {
  object,
  string,
  number,
  maxLength,
  minValue,
  picklist,
  optional,
  pipe,
  integer,
  isoDateTime,
  isoDate,
  type InferInput,
} from 'valibot'

// Estados de visita
const ESTADOS_VISITA = [
  'PROGRAMADA',
  'EN CURSO',
  'COMPLETADA',
  'CANCELADA',
  'REPROGRAMADA',
] as const

// Motivos de visita
const MOTIVOS_VISITA = [
  'MEDICION',
  'RE-MEDICION',
  'REPARACION',
  'ASESORAMIENTO',
  'VISITA INICIAL',
] as const

export const createVisitaSchema = object({
  fecha_hora_visita: pipe(
    string('La fecha y hora de visita es obligatoria'),
    isoDateTime('Debe ser una fecha y hora válida en formato ISO'),
  ),
  cod_obra: optional(
    pipe(
      number('El código de obra debe ser un número válido'),
      integer('El código de obra debe ser un número entero'),
      minValue(1, 'El código de obra debe ser un número positivo'),
    ),
  ),
  cod_postal: optional(
    pipe(
      number('El código postal debe ser un número válido'),
      integer('El código postal debe ser un número entero'),
      minValue(1, 'El código postal debe ser un número positivo'),
    ),
  ),
  motivo_visita: picklist(
    MOTIVOS_VISITA,
    'Seleccione un motivo de visita válido',
  ),
  estado: picklist(ESTADOS_VISITA, 'Seleccione un estado válido'),
  observaciones: optional(
    pipe(
      string('Las observaciones deben ser texto válido'),
      maxLength(500, 'Las observaciones no pueden exceder 500 caracteres'),
    ),
  ),
  direccion_visita: optional(
    pipe(
      string('La dirección debe ser texto válido'),
      maxLength(500, 'La dirección no puede exceder 500 caracteres'),
    ),
  ),
})

export const updateVisitaSchema = object({
  fecha_hora_visita: optional(
    pipe(
      string('La fecha y hora de visita debe ser texto válido'),
      isoDateTime('Debe ser una fecha y hora válida en formato ISO'),
    ),
  ),
  cod_obra: optional(
    pipe(
      number('El código de obra debe ser un número válido'),
      integer('El código de obra debe ser un número entero'),
      minValue(1, 'El código de obra debe ser un número positivo'),
    ),
  ),
  cod_postal: optional(
    pipe(
      number('El código postal debe ser un número válido'),
      integer('El código postal debe ser un número entero'),
      minValue(1, 'El código postal debe ser un número positivo'),
    ),
  ),
  motivo_visita: optional(
    picklist(MOTIVOS_VISITA, 'Seleccione un motivo de visita válido'),
  ),
  estado: optional(picklist(ESTADOS_VISITA, 'Seleccione un estado válido')),
  observaciones: optional(
    pipe(
      string('Las observaciones deben ser texto válido'),
      maxLength(500, 'Las observaciones no pueden exceder 500 caracteres'),
    ),
  ),
  direccion_visita: optional(
    pipe(
      string('La dirección debe ser texto válido'),
      maxLength(500, 'La dirección no puede exceder 500 caracteres'),
    ),
  ),
  fecha_cancelacion: optional(
    pipe(
      string('La fecha de cancelación debe ser texto válido'),
      isoDate('Debe ser una fecha válida en formato ISO'),
    ),
  ),
})

// Tipos TypeScript derivados de los schemas
export type CreateVisitaInput = InferInput<typeof createVisitaSchema>
export type UpdateVisitaInput = InferInput<typeof updateVisitaSchema>
