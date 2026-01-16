import * as v from 'valibot'
import dotenv from 'dotenv'
import { envSchema, type Env } from './envSchema.js'

dotenv.config()

function validateEnv(): Env {
  try {
    const parsed = v.parse(envSchema, process.env)

    if (parsed.STORAGE_PROVIDER === 'cloudinary') {
      if (
        !parsed.CLOUDINARY_CLOUD_NAME ||
        !parsed.CLOUDINARY_API_KEY ||
        !parsed.CLOUDINARY_API_SECRET
      ) {
        throw new Error(
          'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET son requeridas cuando STORAGE_PROVIDER=cloudinary',
        )
      }
    }

    return parsed
  } catch (error) {
    if (error instanceof v.ValiError) {
      console.error('Error de validacion de variables de entorno:')
      for (const issue of error.issues) {
        console.error(
          `  - ${issue.path?.map((p: { key: string }) => p.key).join('.')}: ${issue.message}`,
        )
      }
    } else {
      console.error('Error al validar variables de entorno:', error)
    }

    console.error(
      '\nAsegurate de tener un archivo .env con todas las variables requeridas.',
    )
    console.error(
      '   Consulta .env.example para ver un ejemplo de configuracion.\n',
    )

    process.exit(1)
  }
}

export const env = validateEnv()
