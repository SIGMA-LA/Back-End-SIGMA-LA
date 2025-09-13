import {
  object,
  string,
  minLength,
  maxLength,
  regex,
  picklist,
  optional,
  pipe,
  bigint,
  type InferInput,
} from 'valibot'

// Roles
const ROLES_EMPLEADO = [
  'VENTAS',
  'ADMIN',
  'ENCARGADO',
  'COORDINACION',
  'VISITADOR',
] as const

// Áreas de trabajo
const AREAS_TRABAJO = [
  'COORDINACION',
  'VENTAS',
  'PRODUCCION',
  'CORTE',
  'MECANIZADO',
  'ENSAMBLE',
  'ALMACEN',
  'ATENCION_CLIENTE',
  'COMPRAS',
  'RECURSOS_HUMANOS',
  'FINANZAS',
] as const

export const createEmpleadoSchema = object({
  cuil: pipe(
    bigint('El CUIL es obligatorio y debe ser un número'),
    // Validación adicional para CUIL se puede agregar aquí si necesitas
  ),
  nombre: pipe(
    string('El nombre es obligatorio'),
    minLength(2, 'El nombre debe tener al menos 2 caracteres'),
    maxLength(50, 'El nombre no debe superar los 50 caracteres'),
    regex(
      /^[A-Za-zÀ-ÿ\u00f1\u00d1\s'.-]+$/,
      'El nombre solo puede contener letras, espacios, acentos, apostrofes y guiones',
    ),
  ),
  apellido: pipe(
    string('El apellido es obligatorio'),
    minLength(2, 'El apellido debe tener al menos 2 caracteres'),
    maxLength(50, 'El apellido no debe superar los 50 caracteres'),
    regex(
      /^[A-Za-zÀ-ÿ\u00f1\u00d1\s'.-]+$/,
      'El apellido solo puede contener letras, espacios, acentos, apostrofes y guiones',
    ),
  ),
  rol_actual: picklist(ROLES_EMPLEADO, 'Seleccione un rol válido'),
  area_trabajo: picklist(AREAS_TRABAJO, 'Seleccione un área de trabajo válida'),
  contrasenia: optional(
    pipe(
      string('La contraseña debe ser un texto válido'),
      minLength(6, 'La contraseña debe tener al menos 6 caracteres'),
      maxLength(50, 'La contraseña no debe superar los 50 caracteres'),
    ),
  ),
})

export const updateEmpleadoSchema = object({
  nombre: optional(
    pipe(
      string('El nombre debe ser un texto válido'),
      minLength(2, 'El nombre debe tener al menos 2 caracteres'),
      maxLength(50, 'El nombre no debe superar los 50 caracteres'),
      regex(
        /^[A-Za-zÀ-ÿ\u00f1\u00d1\s'.-]+$/,
        'El nombre solo puede contener letras, espacios, acentos, apostrofes y guiones',
      ),
    ),
  ),
  apellido: optional(
    pipe(
      string('El apellido debe ser un texto válido'),
      minLength(2, 'El apellido debe tener al menos 2 caracteres'),
      maxLength(50, 'El apellido no debe superar los 50 caracteres'),
      regex(
        /^[A-Za-zÀ-ÿ\u00f1\u00d1\s'.-]+$/,
        'El apellido solo puede contener letras, espacios, acentos, apostrofes y guiones',
      ),
    ),
  ),
  rol_actual: optional(picklist(ROLES_EMPLEADO, 'Seleccione un rol válido')),
  area_trabajo: optional(
    picklist(AREAS_TRABAJO, 'Seleccione un área de trabajo válida'),
  ),
  contrasenia: optional(
    pipe(
      string('La contraseña debe ser un texto válido'),
      minLength(6, 'La contraseña debe tener al menos 6 caracteres'),
      maxLength(50, 'La contraseña no debe superar los 50 caracteres'),
    ),
  ),
})

// Tipos TypeScript derivados de los schemas
export type CreateEmpleadoInput = InferInput<typeof createEmpleadoSchema>
export type UpdateEmpleadoInput = InferInput<typeof updateEmpleadoSchema>
