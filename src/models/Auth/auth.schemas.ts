import { object, string, minLength, maxLength, bigint, pipe } from 'valibot'

/**
 * Esquema de validación para el registro de empleados (visitadores).
 */
export const registerSchema = object({
  cuil: bigint(),
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
  cuil: bigint(),
  contrasenia: pipe(string(), minLength(8), maxLength(50)),
})
