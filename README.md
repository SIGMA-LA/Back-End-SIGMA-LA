# Back-End SIGMA-LA

Esta es la API robusta del sistema SIGMA-LA, construida con **Node.js**, **Express** y **Prisma ORM**. Maneja la lógica de negocio para obras, clientes, empleados, maquinaria y más.

## Estructura del Proyecto

La arquitectura sigue una organización modular basada en entidades:

```text
src/
├── config/           # Configuración (db.ts, env.ts, etc.)
├── middleware/       # Middlewares de Express (auth, validation, errors)
├── models/           # Módulos por entidad
│   └── [Entidad]/
│       ├── entidad.controller.ts  # Manejo de peticiones HTTP
│       ├── entidad.service.ts     # Lógica de negocio
│       ├── entidad.repository.ts  # Capa de acceso a datos (Prisma)
│       ├── entidad.routes.ts      # Definición de endpoints
│       └── entidad.routes.spec.ts # Pruebas de integración
├── routes/           # Punto de entrada de rutas principales
├── app.ts            # Configuración de la aplicación Express
└── server.ts         # Inicio del servidor
```

## Arquitectura y Convenciones

### Capas del Sistema
-   **Controllers**: Validan la entrada básica y llaman a los servicios. No contienen lógica de negocio compleja.
-   **Services**: Contienen la "verdad" del negocio. Orquestan llamadas a repositorios y otros servicios.
-   **Repositories**: Único punto de contacto con **Prisma**. Abstraen las consultas a los modelos de la base de datos.

### Validación de Datos
Se utiliza **Valibot** para garantizar la integridad de los datos:
-   Los esquemas se definen para `body`, `params` y `query`.
-   Un middleware de validación intercepta las peticiones y devuelve errores detallados si no se cumple el esquema.

### Autenticación
-   Basada en **JWT**.
-   Middleware `auth.middleware.ts` para proteger rutas.
-   Soporte para roles y permisos a nivel de controlador.

## Funciones Clave

### Patrón Repository
Ubicado en cada carpeta de entidad dentro de `src/models/`. Abstrae la lógica de persistencia de Prisma.
-   **Uso**: Permite cambiar la fuente de datos o realizar optimizaciones de consulta sin afectar los servicios.
-   **Ejemplo**: `ObraRepository.buscar(q, pagination)` centraliza búsquedas complejas que incluyen relaciones y ordenamiento.

### `ReportService`
Ubicado en `src/shared/providers/email/ReportService.ts`.
-   **Generación de PDF**: Utiliza `pdfkit` para construir el documento capa por capa.
-   **Gráficos**: Integra `quickchart-js` para generar gráficos en el servidor y embeberlos como imágenes en el PDF.
-   **Automatización**: Puede ser invocado por tareas programadas para enviar reportes periódicos a los administradores.

## Flujos Principales

### Ciclo de una Petición API
1.  **Ruta**: La petición llega a un endpoint definido en `src/models/[Entidad]/entidad.routes.ts`.
2.  **Validación**: Un middleware de Valibot verifica que el `body` o `params` sean correctos antes de que el controlador reciba nada.
3.  **Controlador**: Desempaqueta los datos y delega al **Servicio**.
4.  **Servicio**: Valida reglas de negocio (ej. "¿tiene el cliente crédito suficiente?") y llama al **Repositorio**.
5.  **Repositorio**: Realiza la operación en la base de datos mediante **Prisma**.
6.  **Respuesta**: El controlador envía un JSON estandarizado al cliente.

### Flujo de Generación de Reportes
1.  **Activación**: Un servicio (ej. `ObraService`) solicita un reporte.
2.  **Recolección**: El `ReportService` consulta a múltiples servicios para obtener métricas (obras, pagos, visitas).
3.  **Renderizado**: Se generan los gráficos con `QuickChart` y se construye el PDF con `PDFKit`.
4.  **Entrega**: El PDF se envía como adjunto mediante el `EmailService` (Nodemailer).

## Scripts Principales

-   `pnpm run start:dev`: Inicia el servidor en modo desarrollo con recarga automática.
-   `pnpm run build`: Compila el proyecto TypeScript a la carpeta `dist`.
-   `pnpm run db:migrate`: Aplica las migraciones de Prisma.
-   `pnpm run seed`: Resetea la base de datos y carga datos iniciales (CUIDADO: borra datos existentes).
-   `pnpm run test`: Ejecuta la suite de pruebas con **Vitest**.

## Levantamiento del Proyecto

1.  **Dependencias**: `pnpm install`
2.  **Variables de Entorno**:
    -   Copia `.env.example` a `.env` y completa los valores.
    -   La variable `DATABASE_URL` debe apuntar a una instancia de PostgreSQL.
3.  **Base de Datos**: `pnpm run seed` para inicializar el esquema y datos básicos.
4.  **Ejecución**: `pnpm run start:dev`

---

Para más información sobre la aplicación cliente, consulta el [README del Front-End](../Front-End-SIGMA-LA/README.md).
