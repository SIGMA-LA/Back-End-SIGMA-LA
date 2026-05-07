export const ERROR_MAP: Record<string, string> = {
  // Auth
  'INVALID_CREDENTIALS': 'CUIL o contraseña incorrectos',
  'USER_NOT_FOUND': 'Usuario no encontrado',
  'INVALID_REFRESH_TOKEN': 'Sesión expirada o inválida, por favor inicie sesión nuevamente',
  'UNAUTHORIZED': 'No tiene permisos para realizar esta acción',
  
  // Obras
  'OBRA_NOT_FOUND': 'Obra no encontrada',
  'INVALID_ID': 'Código identificador inválido',
  'DUPLICATE_ENTRY': 'Ya existe un registro con estos datos',
  
  // Visitas
  'VISITA_NOT_FOUND': 'Visita no encontrada',
  'VISITA_EMPLEADO_NOT_FOUND': 'Relación empleado-visita no encontrada',
  'MISSING_PARAMS': 'Faltan parámetros requeridos en la búsqueda',
  
  // Vehiculos & Maquinarias
  'VEHICULO_NOT_FOUND': 'Vehículo no encontrado',
  'DUPLICATE_PATENTE': 'Ya existe un vehículo con esa patente',
  'USO_VEHICULO_VISITA_NOT_FOUND': 'Registro de uso de vehículo no encontrado',
  'USO_VEHICULO_ENTREGA_NOT_FOUND': 'Registro de uso de vehículo por entrega no encontrado',
  'MAQUINARIA_NOT_FOUND': 'Maquinaria no encontrada',
  'USO_MAQUINARIA_NOT_FOUND': 'Uso de maquinaria no encontrado',
  'MAQUINARIA_INVALID_STATE': 'La maquinaria debe estar en el estado no disponible para poder eliminarla.',
  'VEHICULO_INVALID_STATE': 'El vehículo debe estar en el estado fuera de servicio para poder eliminarlo.',
  
  // Pagos
  'PAGO_NOT_FOUND': 'Pago no encontrado',
  
  // Otros
  'INTERNAL_SERVER_ERROR': 'Algo salió mal, por favor intente nuevamente en unos minutos',
  'VALIDATION_ERROR': 'Error de validación en los datos enviados',
  'INVALID_DATE': 'Las fechas proporcionadas no son válidas',
  'INVALID_DATE_RANGE': 'La fecha de inicio no puede ser posterior a la fecha de fin',
  'FILE_REQUIRED': 'No se ha subido ningún archivo',
  'FOREIGN_KEY_CONSTRAINT': 'No se puede eliminar el registro debido a que tiene datos asociados',
  'INVALID_STATE': 'La operación no es válida para el estado actual del registro',
  'QUERY_PARAM_REQUIRED': 'Falta un parámetro requerido en la consulta',
  'FILE_NOT_FOUND': 'Archivo no encontrado',
  'INVALID_QUERY_PARAMS': 'Parámetros de consulta no válidos',
  'SEARCH_TOO_LONG': 'El término de búsqueda es demasiado largo',
  
  // Ubicaciones
  'PROVINCIA_NOT_FOUND': 'Provincia no encontrada',
  'LOCALIDAD_NOT_FOUND': 'Localidad no encontrada',
  
  // Producción
  'ORDEN_NOT_FOUND': 'Orden de producción no encontrada',
  'PARAMETRO_NOT_FOUND': 'Parámetro no encontrado',
  'PRESUPUESTO_NOT_FOUND': 'Presupuesto no encontrado',
}
