import { PrismaClient } from '@/generated/prisma'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

let prisma: PrismaClient

function getDbPath(): string {
  if (app.isPackaged) {
    // En production, la DB est dans userData (writable)
    const userDataPath = app.getPath('userData')
    return path.join(userDataPath, 'tamagotchi.db')
  }
  // En dev, utiliser le chemin du projet
  return path.join(process.cwd(), 'prisma', 'prisma', 'tamagotchi.db')
}

function ensureDatabase(): void {
  if (!app.isPackaged) return

  const userDbPath = getDbPath()

  // Si la DB existe déjà dans userData, ne rien faire
  if (fs.existsSync(userDbPath)) {
    console.log('Database already exists in userData')
    return
  }

  // Copier la DB pré-seedée depuis les ressources
  const sourceDbPath = path.join(process.resourcesPath, 'db', 'tamagotchi.db')

  if (fs.existsSync(sourceDbPath)) {
    // Créer le dossier parent si nécessaire
    const userDataPath = path.dirname(userDbPath)
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }

    fs.copyFileSync(sourceDbPath, userDbPath)
    console.log('Database copied from resources to userData')
  } else {
    console.error('Source database not found in resources:', sourceDbPath)
  }
}

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    // S'assurer que la DB existe (copie si nécessaire)
    ensureDatabase()

    // Configurer DATABASE_URL avant de créer le client
    const dbPath = getDbPath()
    process.env.DATABASE_URL = `file:${dbPath}`

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
