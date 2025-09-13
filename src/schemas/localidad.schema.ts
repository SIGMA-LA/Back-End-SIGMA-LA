import {
  object,
  string,
  number,
  optional,
  pipe,
  minLength,
  maxLength,
  minValue,
  maxValue,
  type InferInput,
} from 'valibot'

export const createLocalidadSchema = object({
  cod_postal: pipe(
    number('El código postal es obligatorio'),
    minValue(1000, 'El código postal debe ser mayor a 1000'),
    maxValue(9999, 'El código postal debe ser menor a 10000'),
  ),
  nombre_localidad: pipe(
    string('El nombre de la localidad es obligatorio'),
    minLength(2, 'El nombre debe tener al menos 2 caracteres'),
    maxLength(255, 'El nombre no debe superar los 255 caracteres'),
  ),
})

export const updateLocalidadSchema = object({
  cod_postal: optional(
    pipe(
      number('El código postal debe ser un número'),
      minValue(1000, 'El código postal debe ser mayor a 1000'),
      maxValue(9999, 'El código postal debe ser menor a 10000'),
    ),
  ),
  nombre_localidad: optional(
    pipe(
      string('El nombre de la localidad debe ser un texto válido'),
      minLength(2, 'El nombre debe tener al menos 2 caracteres'),
      maxLength(255, 'El nombre no debe superar los 255 caracteres'),
    ),
  ),
})

// Tipos TypeScript derivados de los schemas
export type CreateLocalidadInput = InferInput<typeof createLocalidadSchema>
export type UpdateLocalidadInput = InferInput<typeof updateLocalidadSchema>
