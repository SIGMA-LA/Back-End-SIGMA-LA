import * as v from 'valibot'

// Schema base para visita
const visitaBaseSchema = v.object({
  cod_obra: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(1, 'El código de obra debe ser un número positivo'),
  ),
  cod_postal: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(1, 'El código postal debe ser un número positivo'),
  ),
  motivo_visita: v.pipe(
    v.string(),
    v.nonEmpty('El motivo de visita es requerido'),
    v.maxLength(50, 'El motivo no puede exceder 50 caracteres'),
  ),
  estado: v.pipe(
    v.string(),
    v.nonEmpty('El estado es requerido'),
    v.maxLength(50, 'El estado no puede exceder 50 caracteres'),
  ),
  observaciones: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, 'Las observaciones no pueden exceder 500 caracteres'),
    ),
  ),
  direccion_visita: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, 'La dirección no puede exceder 500 caracteres'),
    ),
  ),
})

// Schema para crear visita
export const createVisitaSchema = v.object({
  ...visitaBaseSchema.entries,
  fecha_hora_visita: v.union([
    v.pipe(v.string(), v.isoDateTime('Debe ser una fecha y hora válida')),
    v.date(),
  ]),
})

// Schema para actualizar visita
export const updateVisitaSchema = v.object({
  cod_obra: v.optional(
    v.pipe(
      v.number(),
      v.integer(),
      v.minValue(1, 'El código de obra debe ser un número positivo'),
    ),
  ),
  cod_postal: v.optional(
    v.pipe(
      v.number(),
      v.integer(),
      v.minValue(1, 'El código postal debe ser un número positivo'),
    ),
  ),
  motivo_visita: v.optional(
    v.pipe(
      v.string(),
      v.nonEmpty('El motivo de visita es requerido'),
      v.maxLength(50, 'El motivo no puede exceder 50 caracteres'),
    ),
  ),
  estado: v.optional(
    v.pipe(
      v.string(),
      v.nonEmpty('El estado es requerido'),
      v.maxLength(50, 'El estado no puede exceder 50 caracteres'),
    ),
  ),
  observaciones: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, 'Las observaciones no pueden exceder 500 caracteres'),
    ),
  ),
  direccion_visita: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, 'La dirección no puede exceder 500 caracteres'),
    ),
  ),
  fecha_cancelacion: v.optional(
    v.union([
      v.pipe(v.string(), v.isoDate('Debe ser una fecha válida')),
      v.date(),
    ]),
  ),
})

// Schema para parámetros de ruta
export const visitaParamsSchema = v.object({
  fecha_hora_visita: v.pipe(
    v.string(),
    v.isoDateTime('Debe ser una fecha y hora válida'),
  ),
  cod_obra: v.pipe(
    v.string(),
    v.regex(/^\d+$/, 'Debe ser un número válido'),
    v.transform(Number),
  ),
})

// Tipos TypeScript inferidos
export type CreateVisitaInput = v.InferInput<typeof createVisitaSchema>
export type UpdateVisitaInput = v.InferInput<typeof updateVisitaSchema>
export type VisitaParams = v.InferInput<typeof visitaParamsSchema>
