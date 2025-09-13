import {
  object,
  string,
  minLength,
  maxLength,
  regex,
  picklist,
  optional,
  pipe,
  type InferInput,
} from 'valibot'

// Regex para validar formato de patente argentina (ej: ABC123, AB123CD, etc.)
const PATENTE_REGEX = /^[A-Z]{2,3}[0-9]{3}([A-Z]{2})?$/

// Enum de tipos de vehículo
const TIPOS_VEHICULO = [
  'CAMION CHICO',
  'CAMIONETA',
  'AUTOMOVIL',
  'CAMION GRANDE',
] as const

// Estados de vehículo
const ESTADOS_VEHICULO = [
  'DISPONIBLE',
  'EN USO',
  'MANTENIMIENTO',
  'REPARACION',
  'FUERA DE SERVICIO',
  'RESERVADO',
] as const

export const createVehiculoSchema = object({
  patente: pipe(
    string('La patente es obligatoria'),
    minLength(6, 'La patente debe tener al menos 6 caracteres'),
    maxLength(10, 'La patente no debe superar los 10 caracteres'),
    regex(
      PATENTE_REGEX,
      'Formato de patente inválido. Debe ser formato argentino (ej: ABC123 o AB123CD)',
    ),
  ),
  tipo_vehiculo: picklist(
    TIPOS_VEHICULO,
    'Seleccione un tipo de vehículo válido',
  ),
  estado: picklist(ESTADOS_VEHICULO, 'Seleccione un estado válido'),
})

export const updateVehiculoSchema = object({
  patente: optional(
    pipe(
      string('La patente debe ser un texto válido'),
      minLength(6, 'La patente debe tener al menos 6 caracteres'),
      maxLength(10, 'La patente no debe superar los 10 caracteres'),
      regex(
        PATENTE_REGEX,
        'Formato de patente inválido. Debe ser formato argentino (ej: ABC123 o AB123CD)',
      ),
    ),
  ),
  tipo_vehiculo: optional(
    picklist(TIPOS_VEHICULO, 'Seleccione un tipo de vehículo válido'),
  ),
  estado: optional(picklist(ESTADOS_VEHICULO, 'Seleccione un estado válido')),
})

// Tipos TypeScript derivados de los schemas
export type CreateVehiculoInput = InferInput<typeof createVehiculoSchema>
export type UpdateVehiculoInput = InferInput<typeof updateVehiculoSchema>
