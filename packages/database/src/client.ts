import { PrismaClient } from './generated'
import { withAccelerate } from '@prisma/extension-accelerate'

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

export const db = globalForPrisma.prisma ?? prisma.$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect()
})

process.on('SIGINT', async () => {
  await db.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await db.$disconnect()
  process.exit(0)
})