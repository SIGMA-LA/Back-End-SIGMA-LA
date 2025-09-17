import {
  object,
  string,
  number,
  optional,
  pipe,
  minValue,
  maxValue,
  regex,
  transform,
  type InferInput,
} from 'valibot'

// Regex para validar formato de fecha ISO (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

// Regex para validar formato de hora (HH:MM:SS o HH:MM:SS.sss)
const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.\d{1,6})?$/

export const createParametroSchema = object({
  fecha_cambio: pipe(
    string('La fecha de cambio es obligatoria'),
    regex(DATE_REGEX, 'Formato de fecha inválido. Use YYYY-MM-DD'),
    transform(value => new Date(value + 'T00:00:00.000Z')),
  ),
  hora_cambio: pipe(
    string('La hora de cambio es obligatoria'),
    regex(TIME_REGEX, 'Formato de hora inválido. Use HH:MM:SS o HH:MM:SS.sss'),
    transform(value => {
      const today = new Date().toISOString().split('T')[0]
      return new Date(`${today}T${value}Z`)
    }),
  ),
  dias_vigencia_presu: pipe(
    number('Los días de vigencia del presupuesto deben ser un número'),
    minValue(1, 'Los días de vigencia deben ser al menos 1'),
    maxValue(365, 'Los días de vigencia no pueden superar 365 días'),
  ),
  viatico_dia_persona: optional(
    pipe(
      number('El viático por día por persona debe ser un número'),
      minValue(0, 'El viático no puede ser negativo'),
    ),
  ),
})

export const updateParametroSchema = object({
  cod_parametro: number('El identificador del parámetro es obligatorio'),
  fecha_cambio: optional(
    pipe(
      string('La fecha de cambio debe ser válida'),
      regex(DATE_REGEX, 'Formato de fecha inválido. Use YYYY-MM-DD'),
      transform(value => new Date(value + 'T00:00:00.000Z')),
    ),
  ),
  hora_cambio: optional(
    pipe(
      string('La hora de cambio debe ser válida'),
      regex(
        TIME_REGEX,
        'Formato de hora inválido. Use HH:MM:SS o HH:MM:SS.sss',
      ),
      transform(value => {
        const today = new Date().toISOString().split('T')[0]
        return new Date(`${today}T${value}Z`)
      }),
    ),
  ),
  dias_vigencia_presu: optional(
    pipe(
      number('Los días de vigencia del presupuesto deben ser un número'),
      minValue(1, 'Los días de vigencia deben ser al menos 1'),
      maxValue(365, 'Los días de vigencia no pueden superar 365 días'),
    ),
  ),
  viatico_dia_persona: optional(
    pipe(
      number('El viático por día por persona debe ser un número'),
      minValue(0, 'El viático no puede ser negativo'),
    ),
  ),
})

// Tipos TypeScript derivados de los schemas
export type CreateParametroInput = InferInput<typeof createParametroSchema>
export type UpdateParametroInput = InferInput<typeof updateParametroSchema>
