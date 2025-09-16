import { object, string, minLength, maxLength, regex, pipe } from 'valibot'

/**
 * Esquema de validación para el registro de empleados (visitadores).
 */
export const registerSchema = object({
  cuil: pipe(
    string('El CUIL es obligatorio y debe ser un string numérico'),
    minLength(11, 'El CUIL debe tener 11 dígitos'),
    maxLength(13, 'El CUIL no debe superar los 13 caracteres'),
    regex(
      /^\d{11,13}$/,
      'El CUIL debe contener solo números (11 a 13 dígitos)',
    ),
  ),
  nombre: pipe(string(), minLength(2), maxLength(50)),
  apellido: pipe(string(), minLength(2), maxLength(50)),
  rol_actual: pipe(string(), minLength(2), maxLength(50)),
  area_trabajo: pipe(string(), minLength(2), maxLength(50)),
  contrasenia: pipe(string(), minLength(8), maxLength(50)),
})

/**
 * Esquema de validación para login de empleados.
 */
export const loginSchema = object({
  cuil: pipe(
    string('El CUIL es obligatorio y debe ser un string numérico'),
    minLength(11, 'El CUIL debe tener 11 dígitos'),
    maxLength(13, 'El CUIL no debe superar los 13 caracteres'),
    regex(
      /^\d{11,13}$/,
      'El CUIL debe contener solo números (11 a 13 dígitos)',
    ),
  ),
  contrasenia: pipe(string(), minLength(8), maxLength(50)),
})
