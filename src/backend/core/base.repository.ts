/**
 * Base repository class providing common database operations
 * All repositories should extend this class
 */

import { PrismaClient } from '@prisma/client'
import { getPrismaClient } from '../database/prisma'

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected get prisma(): PrismaClient {
    return getPrismaClient()
  }

  abstract findAll(): Promise<T[]>
  abstract findById(id: string): Promise<T | null>
  abstract create(data: CreateInput): Promise<T>
  abstract update(id: string, data: UpdateInput): Promise<T>
  abstract delete(id: string): Promise<T>
}

/**
 * Read-only repository for entities that don't support mutations
 */
export abstract class ReadOnlyRepository<T> {
  protected get prisma(): PrismaClient {
    return getPrismaClient()
  }

  abstract findAll(): Promise<T[]>
  abstract findById(id: string): Promise<T | null>
}

/**
 * Singleton repository for entities with only one record (e.g., Wallet, GameStats)
 */
export abstract class SingletonRepository<T, UpdateInput> {
  protected get prisma(): PrismaClient {
    return getPrismaClient()
  }

  abstract get(): Promise<T>
  abstract update(data: UpdateInput): Promise<T>
}
