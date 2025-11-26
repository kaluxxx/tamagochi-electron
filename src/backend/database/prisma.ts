import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import Module from 'module'

let prisma: any

function getDbPath(): string {
  if (app.isPackaged) {
    // En production, la DB est dans userData (writable)
    const userDataPath = app.getPath('userData')
    return path.join(userDataPath, 'tamagotchi.db')
  }
  // En dev, utiliser le chemin du projet
  return path.join(process.cwd(), 'prisma', 'prisma', 'tamagotchi.db')
}

function setupPrismaForPackagedApp() {
  if (app.isPackaged) {
    // Chemin vers les modules Prisma dans extraResources
    const prismaClientPath = path.join(process.resourcesPath, 'prisma-client')

    // Ajouter le chemin aux chemins de recherche de modules
    const originalResolveFilename = (Module as any)._resolveFilename
    ;(Module as any)._resolveFilename = function (
      request: string,
      parent: any,
      isMain: boolean,
      options: any
    ) {
      // Rediriger les imports Prisma vers extraResources
      if (request === '@prisma/client' || request.startsWith('@prisma/client/')) {
        const newPath = path.join(prismaClientPath, request)
        if (fs.existsSync(newPath) || fs.existsSync(newPath + '.js')) {
          return originalResolveFilename.call(this, newPath, parent, isMain, options)
        }
      }
      if (request === '.prisma/client' || request.startsWith('.prisma/client/')) {
        const newPath = path.join(prismaClientPath, request)
        if (fs.existsSync(newPath) || fs.existsSync(newPath + '.js')) {
          return originalResolveFilename.call(this, newPath, parent, isMain, options)
        }
      }
      return originalResolveFilename.call(this, request, parent, isMain, options)
    }
  }

  // Configurer DATABASE_URL
  const dbPath = getDbPath()
  process.env.DATABASE_URL = `file:${dbPath}`
}

export function getPrismaClient() {
  if (!prisma) {
    setupPrismaForPackagedApp()

    // Import dynamique après configuration des chemins
    const { PrismaClient } = require('@prisma/client')
    prisma = new PrismaClient({
      log: ['error', 'warn']
    })
  }
  return prisma
}

export async function initializeDatabase() {
  try {
    const client = getPrismaClient()
    await client.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Failed to connect to database:', error)
    throw error
  }
}

export async function closeDatabase() {
  if (prisma) {
    await prisma.$disconnect()
    console.log('Database disconnected')
  }
}
