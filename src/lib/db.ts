import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const DATABASE_URL = process.env.DATABASE_URL || ""

function getDatabaseType(): 'postgresql' | 'mysql' {
  const dbType = process.env.DATABASE_TYPE;
  if (dbType === 'mysql' || dbType === 'postgresql') return dbType;
  if (DATABASE_URL.startsWith('mysql')) return 'mysql';
  return 'postgresql';
}

export const dbType = getDatabaseType()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
