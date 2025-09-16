import {
  object,
  pipe,
  string,
  transform,
  minLength,
  maxLength,
  regex,
} from 'valibot'

// Schema para validar ID numérico en params
export const idParamsSchema = object({
  id: pipe(string('El ID debe ser un string'), transform(Number)),
})

// Schema para validar CUIL en params
export const cuilParamsSchema = object({
  cuil: pipe(
    string('El CUIL debe ser un string'),
    minLength(11, 'El CUIL debe tener 11 dígitos'),
    maxLength(13, 'El CUIL no debe superar los 13 caracteres'),
    regex(
      /^\d{11,13}$/,
      'El CUIL debe contener solo números (11 a 13 dígitos)',
    ),
  ),
})
