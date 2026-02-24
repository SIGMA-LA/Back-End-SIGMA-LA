# Back-End SIGMA LA

Este proyecto es el backend de un sistema de gestión hecho a medida para la empresa Luhmann Aberturas para menjar entidades como:obras, clientes, empleados, maquinarias y más.
Desarrollado en Node.js con Express, Prisma y TypeScript.

## Scripts principales

- `pnpm run start:dev`  
  Inicia el servidor en modo desarrollo con recarga automática.

- `pnpm run build`  
  Compila el proyecto TypeScript a JavaScript en la carpeta `dist`.

- `pnpm run start:prod`  
  Inicia el servidor en modo producción usando los archivos compilados.

- `pnpm run db:migrate`  
  Aplica las migraciones de Prisma en desarrollo.

- `pnpm run db:studio`  
  Abre Prisma Studio para explorar la base de datos.

- `pnpm run seed`  
  **Resetea la base de datos** (elimina todo y aplica migraciones) y ejecuta el seeder para poblarla con datos de ejemplo.

## Cómo levantar el proyecto

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Configurar las variables de entorno:
   - Copia el archivo `.env.example` a `.env`
   - Completa todas las variables requeridas
   - Los secretos JWT deben generarse con: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - Las variables se validan automáticamente al iniciar la app

3. Ejecutar migraciones y seed:

   ```bash
   pnpm run seed
   ```

4. Iniciar el servidor:
   ```bash
   pnpm run start:dev
   ```

**Nota:** Las variables de entorno se validan antes de iniciar el servidor. Si falta alguna variable requerida o su formato es inválido, la aplicación no arrancará. Todas las variables se consumen desde el objeto `env` exportado en `src/config/env.ts`.

---
