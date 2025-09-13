import {
  object,
  string,
  minLength,
  maxLength,
  regex,
  optional,
  pipe,
  bigint,
  type InferInput,
} from 'valibot'

// Regex para validar teléfono argentino (incluye celulares y fijos)
const TELEFONO_REGEX =
  /^(\+54\s?)?(11|2\d{1,3}|3\d{1,3})\s?(\d{3,4})\s?-?\s?(\d{4})$|^(\+54\s?9\s?)?(11|2\d{1,3}|3\d{1,3})\s?(\d{4})\s?-?\s?(\d{4})$/

// Regex para validar email
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const createClienteSchema = object({
  cuil: pipe(bigint('El CUIL/CUIT es obligatorio y debe ser un número')),
  razon_social: pipe(
    string('La razón social es obligatoria'),
    minLength(2, 'La razón social debe tener al menos 2 caracteres'),
    maxLength(50, 'La razón social no debe superar los 50 caracteres'),
    regex(
      /^[A-Za-zÀ-ÿ\u00f1\u00d1\s'.&0-9()-]+$/,
      'La razón social contiene caracteres no válidos',
    ),
  ),
  telefono: pipe(
    string('El teléfono es obligatorio'),
    minLength(8, 'El teléfono debe tener al menos 8 dígitos'),
    maxLength(20, 'El teléfono no debe superar los 20 caracteres'),
    regex(
      TELEFONO_REGEX,
      'Formato de teléfono inválido. Use formato argentino (ej: 11-1234-5678 o +54 9 11 1234 5678)',
    ),
  ),
  mail: pipe(
    string('El email es obligatorio'),
    minLength(5, 'El email debe tener al menos 5 caracteres'),
    maxLength(100, 'El email no debe superar los 100 caracteres'),
    regex(EMAIL_REGEX, 'Formato de email inválido'),
  ),
})

export const updateClienteSchema = object({
  razon_social: optional(
    pipe(
      string('La razón social debe ser un texto válido'),
      minLength(2, 'La razón social debe tener al menos 2 caracteres'),
      maxLength(50, 'La razón social no debe superar los 50 caracteres'),
      regex(
        /^[A-Za-zÀ-ÿ\u00f1\u00d1\s'.&0-9()-]+$/,
        'La razón social contiene caracteres no válidos',
      ),
    ),
  ),
  telefono: optional(
    pipe(
      string('El teléfono debe ser un texto válido'),
      minLength(8, 'El teléfono debe tener al menos 8 dígitos'),
      maxLength(20, 'El teléfono no debe superar los 20 caracteres'),
      regex(
        TELEFONO_REGEX,
        'Formato de teléfono inválido. Use formato argentino (ej: 11-1234-5678 o +54 9 11 1234 5678)',
      ),
    ),
  ),
  mail: optional(
    pipe(
      string('El email debe ser un texto válido'),
      minLength(5, 'El email debe tener al menos 5 caracteres'),
      maxLength(100, 'El email no debe superar los 100 caracteres'),
      regex(EMAIL_REGEX, 'Formato de email inválido'),
    ),
  ),
})

// Tipos TypeScript derivados de los schemas
export type CreateClienteInput = InferInput<typeof createClienteSchema>
export type UpdateClienteInput = InferInput<typeof updateClienteSchema>
