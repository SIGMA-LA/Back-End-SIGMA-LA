import { PrismaClient } from '@prisma/client'

/**
 * Global variable declaration for Prisma Client instance
 * This prevents multiple instances during development hot reloads
 */
declare global {
  var __prisma: PrismaClient | undefined
}

/**
 * Create Prisma Client with environment-specific configuration
 */
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    errorFormat: 'pretty',
  })
}

/**
 * Singleton Prisma Client instance
 *
 * In development: Uses global variable to persist across hot reloads
 * In production: Creates a single instance
 */
export const prisma = globalThis.__prisma ?? createPrismaClient()

// Store in global variable for development hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

/**
 * Graceful shutdown handler
 */
const disconnect = async (): Promise<void> => {
  await prisma.$disconnect()
}

// Register shutdown handlers
process.on('beforeExit', disconnect)
process.on('SIGINT', disconnect)
process.on('SIGTERM', disconnect)
