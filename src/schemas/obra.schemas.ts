import {
  object,
  number,
  string,
  date,
  optional,
  pipe,
  minLength,
  maxLength,
  InferInput,
  transform,
  regex,
} from 'valibot'

export const createObraSchema = object({
  cod_postal: pipe(number('El código postal es requerido.')),

  cuil: pipe(
    string('El CUIL es requerido y debe ser un string numérico.'),
    minLength(11, 'El CUIL debe tener 11 dígitos'),
    maxLength(13, 'El CUIL no debe superar los 13 caracteres'),
    regex(
      /^\d{11,13}$/,
      'El CUIL debe contener solo números (11 a 13 dígitos)',
    ),
  ),

  fecha_ini: pipe(
    string('La fecha de inicio es requerida y debe ser una fecha válida.'),
    transform(v => new Date(v)),
  ),

  estado: pipe(
    string('El estado es requerido.'),
    minLength(1, 'El estado no puede estar vacío.'),
    maxLength(50, 'El estado no puede exceder los 50 caracteres.'),
  ),

  // Para el campo opcional, envolvemos todo el "pipe" con "optional"
  fecha_cancelacion: optional(
    pipe(
      string('La fecha de cancelación debe ser una fecha válida.'),
      transform(v => new Date(v)),
    ),
  ),

  direccion: pipe(
    string('La dirección es requerida.'),
    minLength(1, 'La dirección no puede estar vacía.'),
    maxLength(500, 'La dirección no puede exceder los 500 caracteres.'),
  ),

  nota_fabrica: pipe(
    string('La nota de fábrica es requerida.'),
    // Si la nota puede estar vacía, simplemente elimina la siguiente línea de minLength
    minLength(1, 'La nota de fábrica no puede estar vacía.'),
    maxLength(255, 'La nota de fábrica no puede exceder los 255 caracteres.'),
  ),
})

export const updateObraSchema = object({
  cod_postal: optional(
    pipe(number('El código postal debe ser un número válido.')),
  ),

  cuil: optional(
    pipe(
      string('El CUIL debe ser un string numérico válido.'),
      minLength(11, 'El CUIL debe tener 11 dígitos'),
      maxLength(13, 'El CUIL no debe superar los 13 caracteres'),
      regex(
        /^\d{11,13}$/,
        'El CUIL debe contener solo números (11 a 13 dígitos)',
      ),
    ),
  ),

  fecha_ini: optional(
    pipe(
      string('La fecha de inicio debe ser una fecha válida.'),
      transform(v => new Date(v)),
    ),
  ),

  estado: optional(
    pipe(
      string('El estado debe ser un texto válido.'),
      minLength(1, 'El estado no puede estar vacío.'),
      maxLength(50, 'El estado no puede exceder los 50 caracteres.'),
    ),
  ),

  fecha_cancelacion: optional(
    pipe(date('La fecha de cancelación debe ser una fecha válida.')),
  ),

  direccion: optional(
    pipe(
      string('La dirección debe ser un texto válido.'),
      minLength(1, 'La dirección no puede estar vacía.'),
      maxLength(500, 'La dirección no puede exceder los 500 caracteres.'),
    ),
  ),

  nota_fabrica: optional(
    pipe(
      string('La nota de fábrica debe ser un texto válido.'),
      // Si la nota puede ser un string vacío, elimina la siguiente línea (minLength)
      minLength(1, 'La nota de fábrica no puede estar vacía.'),
      maxLength(255, 'La nota de fábrica no puede exceder los 255 caracteres.'),
    ),
  ),
})

// Tipo TypeScript derivado del schema
export type UpdateObraInput = InferInput<typeof updateObraSchema>
export type CreateObraInput = InferInput<typeof createObraSchema>
