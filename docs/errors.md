# Documentación de Manejo de Errores Estandarizado

Este documento describe el sistema de manejo de errores estandarizado implementado en el backend.

## Arquitectura

El sistema utiliza una clase `AppError` unificada y un middleware de manejo de errores global para asegurar respuestas consistentes en todos los puntos finales de la API.

### Componentes

1.  **`AppError`**: La clase base para todos los errores operativos.
    *   `message`: Mensaje de error descriptivo.
    *   `statusCode`: Código de estado HTTP (ej., 400, 404, 409, 500).
    *   `isOperational`: Booleano que indica si el error es esperado (true) o un error de programación (false).
    *   `errorCode`: Un código de cadena único para que el frontend identifique y maneje errores específicos (ej., `CONFLICTO_AGENDA`).
    *   `details`: Información adicional opcional (ej., campos de validación).

2.  **`ValidationError`**: Extiende `AppError` (estado 400). Se utiliza para fallas de validación de entrada y violaciones de reglas de negocio.

3.  **`catchAsync`**: Un envoltorio (wrapper) para las funciones del controlador que captura automáticamente los errores y los pasa al manejador de errores global, eliminando la necesidad de bloques `try-catch`.

4.  **Manejador de Errores Global**: Middleware que captura todos los errores, los registra apropiadamente y devuelve una respuesta JSON estandarizada.

## Formato de Respuesta de Error

Todas las respuestas de error siguen esta estructura:

```json
{
  "status": "error",
  "message": "Mensaje legible para humanos",
  "errorCode": "CODIGO_DE_ERROR_ESPECIFICO",
  "details": null
}
```

## Códigos de Error Estandarizados

Los siguientes códigos de error están actualmente en uso:

| Código de Error | Código de Estado | Descripción |
| :--- | :--- | :--- |
| `CONFLICTO_AGENDA` | 400 | Superposición de fechas para recursos (personal, maquinaria, vehículos). |
| `CONFLICTO_CUIL` | 409 | Intento de crear un empleado o cliente con un CUIL duplicado. |
| `DUPLICATE_CLIENTE` | 409 | El cliente ya existe. |
| `DUPLICATE_PATENTE` | 409 | Patente de vehículo duplicada. |
| `PAGO_NOT_FOUND` | 404 | El pago solicitado no existe. |
| `PRESUPUESTO_NOT_FOUND` | 404 | El presupuesto solicitado no existe. |
| `LOCALIDAD_NOT_FOUND` | 404 | La localidad solicitada no existe. |
| `PROVINCIA_NOT_FOUND` | 404 | La provincia solicitada no existe. |
| `PARAMETRO_NOT_FOUND` | 404 | El parámetro solicitado no existe. |
| `ORDEN_PRODUCCION_NOT_FOUND`| 404 | La orden de producción no existe. |
| `VISITA_NOT_FOUND` | 404 | La visita solicitada no existe. |
| `CLIENTE_NOT_FOUND` | 404 | El cliente solicitado no existe. |
| `MAQUINARIA_NOT_FOUND`| 404 | La maquinaria solicitada no existe. |
| `VEHICULO_NOT_FOUND` | 404 | El vehículo solicitado no existe. |
| `EMPLEADO_NOT_FOUND` | 404 | El empleado solicitado no existe. |
| `OBRA_NOT_FOUND` | 404 | La obra solicitada no existe. |
| `ENTREGA_NOT_FOUND` | 404 | La entrega solicitada no existe. |
| `USO_MAQUINARIA_NOT_FOUND` | 404 | El uso de maquinaria solicitado no existe. |
| `USO_VEHICULO_ENTREGA_NOT_FOUND` | 404 | El uso de vehículo de entrega no existe. |
| `USO_VEHICULO_VISITA_NOT_FOUND` | 404 | El uso de vehículo de visita no existe. |
| `ENTREGA_EMPLEADO_NOT_FOUND` | 404 | La relación entrega-empleado no existe. |
| `VISITA_EMPLEADO_NOT_FOUND` | 404 | La relación visita-empleado no existe. |
| `INVALID_DATE` | 400 | La cadena de fecha proporcionada no es válida. |
| `INVALID_DATE_RANGE` | 400 | El rango de fechas es inválido. |
| `INVALID_AMOUNT_RANGE` | 400 | El rango de montos es inválido. |
| `INVALID_ID` | 400 | El formato del ID proporcionado no es válido. |
| `MISSING_PARAMS` | 400 | Faltan parámetros obligatorios. |
| `UNAUTHORIZED` | 401 | El usuario no está autenticado. |
| `INVALID_PASSWORD` | 401 | La contraseña proporcionada es incorrecta. |
| `INTERNAL_SERVER_ERROR`| 500 | Ocurrió un error inesperado en el servidor. |

## Formato de Respuesta Exitosa

Para operaciones exitosas, use la utilidad `sendSuccess`:

```json
{
  "status": "success",
  "message": "Mensaje de operación exitosa",
  "data": { ... }
}
```
