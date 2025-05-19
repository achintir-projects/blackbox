import { PrismaClient } from '@prisma/client'

const getDatabaseUrl = () => {
  const selection = process.env.DATABASE_SELECTION
  if (selection === 'old') {
    return process.env.DATABASE_URL_OLD
  } else if (selection === 'new') {
    return process.env.DATABASE_URL_NEW
  } else {
    throw new Error('Invalid DATABASE_SELECTION environment variable. Must be "old" or "new".')
  }
}

const prismaClientOptions = {
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
