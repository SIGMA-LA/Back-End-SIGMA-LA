import { object, string, optional, picklist, type InferInput } from 'valibot'

// Estados de maquinaria
const ESTADOS_MAQUINARIA = [
  'DISPONIBLE',
  'EN_USO',
  'MANTENIMIENTO',
  'REPARACION',
  'FUERA_DE_SERVICIO',
] as const

export const createMaquinariaSchema = object({
  descripcion: string('La descripción es obligatoria'),
  estado: picklist(ESTADOS_MAQUINARIA, 'Seleccione un estado válido'),
})

export const updateMaquinariaSchema = object({
  descripcion: optional(string('La descripción es obligatoria')),
  estado: optional(picklist(ESTADOS_MAQUINARIA, 'Seleccione un estado válido')),
})

// Tipos TypeScript derivados de los schemas
export type CreateMaquinariaInput = InferInput<typeof createMaquinariaSchema>
export type UpdateMaquinariaInput = InferInput<typeof updateMaquinariaSchema>
