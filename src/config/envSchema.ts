import * as v from 'valibot'

export const envSchema = v.object({
  DATABASE_URL: v.pipe(
    v.string('DATABASE_URL es requerida'),
    v.minLength(1, 'DATABASE_URL no puede estar vacía'),
  ),

  JWT_SECRET: v.pipe(
    v.string('JWT_SECRET es requerida'),
    v.minLength(
      32,
      'JWT_SECRET debe tener al menos 32 caracteres para mayor seguridad',
    ),
  ),

  NODE_AUTH_REFRESH_TOKEN: v.pipe(
    v.string('NODE_AUTH_REFRESH_TOKEN es requerida'),
    v.minLength(1, 'NODE_AUTH_REFRESH_TOKEN no puede estar vacía'),
  ),

  PORT: v.optional(
    v.pipe(
      v.string(),
      v.transform(val => parseInt(val, 10)),
      v.number('PORT debe ser un número'),
      v.minValue(1, 'PORT debe ser mayor a 0'),
      v.maxValue(65535, 'PORT debe ser menor a 65536'),
    ),
    '4000',
  ),

  FRONTEND_URL: v.optional(
    v.pipe(v.string(), v.url('FRONTEND_URL debe ser una URL válida')),
    'http://localhost:5173',
  ),

  NODE_ENV: v.optional(
    v.picklist(
      ['development', 'production', 'test'],
      'NODE_ENV debe ser development, production o test',
    ),
    'development',
  ),

  STORAGE_PROVIDER: v.optional(
    v.picklist(
      ['cloudinary', 'local'],
      'STORAGE_PROVIDER debe ser cloudinary o local',
    ),
    'cloudinary',
  ),

  CLOUDINARY_CLOUD_NAME: v.optional(v.string()),
  CLOUDINARY_API_KEY: v.optional(v.string()),
  CLOUDINARY_API_SECRET: v.optional(v.string()),

  NODE_AUTH_TOKEN: v.optional(v.string()),
})

export type Env = v.InferOutput<typeof envSchema>
