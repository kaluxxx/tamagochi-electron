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
  return path.join(process.cwd(), 'prisma', 'tamagotchi.db')
}

function getTemplateDbPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'prisma', 'template.db')
  }
  // En dev, la template est au même endroit que la DB
  return path.join(process.cwd(), 'prisma', 'template.db')
}

function ensureDbDirectory(): void {
  const dbPath = getDbPath()
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * Copie la DB template vers userData si elle n'existe pas
 */
function copyTemplateDbIfNeeded(): void {
  const dbPath = getDbPath()
  const templatePath = getTemplateDbPath()

  // Si la DB existe déjà et n'est pas vide, ne rien faire
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath)
    if (stats.size > 0) {
      console.log('Database already exists, skipping template copy')
      return
    }
    // Supprimer le fichier vide/corrompu
    fs.unlinkSync(dbPath)
  }

  // Vérifier que la template existe
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template database not found at: ${templatePath}`)
  }

  // Copier la template
  console.log('Copying template database...')
  console.log('  From:', templatePath)
  console.log('  To:', dbPath)
  fs.copyFileSync(templatePath, dbPath)
  console.log('Template database copied successfully')
}

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    // S'assurer que le dossier existe
    ensureDbDirectory()

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
  const dbPath = getDbPath()
  const templatePath = getTemplateDbPath()

  console.log('=== Database Initialization ===')
  console.log('DB Path:', dbPath)
  console.log('Template Path:', templatePath)
  console.log('DB exists:', fs.existsSync(dbPath))
  console.log('Template exists:', fs.existsSync(templatePath))

  try {
    // S'assurer que le dossier existe
    ensureDbDirectory()

    // Copier la template si nécessaire (premier lancement)
    copyTemplateDbIfNeeded()

    // Connecter le client
    const client = getPrismaClient()
    await client.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

export async function closeDatabase() {
  if (prisma) {
    await prisma.$disconnect()
    console.log('Database disconnected')
  }
}