import {
  object,
  date,
  number,
  pipe,
  optional,
  minValue,
  integer,
  type InferInput,
} from 'valibot'

// Esquema para la creación de un nuevo Presupuesto
export const createPresupuestoSchema = object({
  fecha_emision: pipe(
    date('La fecha de emisión es obligatoria y debe ser una fecha válida'),
  ),
  cod_obra: pipe(
    number('El código de obra es obligatorio'),
    integer('El código de obra debe ser un número entero'),
    minValue(1, 'El código de obra debe ser un número positivo'),
  ),
  fecha_aceptacion: optional(
    date('La fecha de aceptación debe ser una fecha válida'),
  ),
  valor: pipe(
    number('El valor del presupuesto es obligatorio'),
    minValue(0, 'El valor del presupuesto no puede ser negativo'),
  ),
})

// Esquema para la actualización de un Presupuesto
// Todos los campos son opcionales
export const updatePresupuestoSchema = object({
  fecha_emision: optional(
    pipe(date('La fecha de emisión debe ser una fecha válida')),
  ),
  cod_obra: optional(
    pipe(
      number('El código de obra debe ser un número'),
      integer('El código de obra debe ser un número entero'),
      minValue(1, 'El código de obra debe ser un número positivo'),
    ),
  ),
  fecha_aceptacion: optional(
    date('La fecha de aceptación debe ser una fecha válida'),
  ),
  valor: optional(
    pipe(
      number('El valor del presupuesto debe ser un número'),
      minValue(0, 'El valor del presupuesto no puede ser negativo'),
    ),
  ),
})

// Tipos de TypeScript derivados de los esquemas para un tipado fuerte
export type CreatePresupuestoInput = InferInput<typeof createPresupuestoSchema>
export type UpdatePresupuestoInput = InferInput<typeof updatePresupuestoSchema>
