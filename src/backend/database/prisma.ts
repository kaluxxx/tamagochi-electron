import { PrismaClient } from '@/generated/prisma'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { seedDatabase } from '../../../prisma/seed'

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

function getMigrationsPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'prisma', 'migrations')
  }
  return path.join(process.cwd(), 'prisma', 'migrations')
}

function isNewDatabase(): boolean {
  const dbPath = getDbPath()
  return !fs.existsSync(dbPath)
}

function ensureDbDirectory(): void {
  const dbPath = getDbPath()
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * Lit et exécute les fichiers SQL des migrations dans l'ordre
 */
async function runMigrations(client: PrismaClient): Promise<void> {
  const migrationsPath = getMigrationsPath()

  if (!fs.existsSync(migrationsPath)) {
    console.error('Migrations folder not found:', migrationsPath)
    throw new Error('Migrations folder not found')
  }

  // Lire les dossiers de migration dans l'ordre chronologique
  const migrationDirs = fs.readdirSync(migrationsPath)
    .filter(dir => fs.statSync(path.join(migrationsPath, dir)).isDirectory())
    .sort() // Les noms commencent par timestamp, donc le tri fonctionne

  console.log(`Found ${migrationDirs.length} migrations to apply`)

  for (const migrationDir of migrationDirs) {
    const sqlPath = path.join(migrationsPath, migrationDir, 'migration.sql')

    if (!fs.existsSync(sqlPath)) {
      console.warn(`No migration.sql in ${migrationDir}, skipping`)
      continue
    }

    console.log(`Applying migration: ${migrationDir}`)
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Splitter le SQL par statements (séparés par ;)
    // Filtrer les lignes vides et commentaires
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      try {
        await client.$executeRawUnsafe(statement)
      } catch (error) {
        // Ignorer les erreurs "table already exists" pour les migrations
        const errorMessage = String(error)
        if (!errorMessage.includes('already exists')) {
          console.error(`Error executing SQL: ${statement.substring(0, 100)}...`)
          throw error
        }
      }
    }
  }

  console.log('All migrations applied successfully')
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
  const needsMigrations = isNewDatabase()

  try {
    const client = getPrismaClient()
    await client.$connect()
    console.log('Database connected successfully')

    // Premier lancement : appliquer les migrations et seed
    if (needsMigrations) {
      console.log('First launch detected - running migrations and seed...')
      await runMigrations(client)
      await seedDatabase(client)
    }
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
