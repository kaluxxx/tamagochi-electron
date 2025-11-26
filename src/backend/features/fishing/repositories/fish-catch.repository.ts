import type { FishCatch, FishSpecies } from '@prisma/client'
import { getPrismaClient } from '../../../database/prisma'

export type FishCatchWithSpecies = FishCatch & { species: FishSpecies }

export interface FishCatchCreateInput {
  speciesId: string
  size: number
  coinsEarned: number
  isFirstCatch: boolean
  locationId: string
  rodId: string
  baitId?: string | null
}

export interface SpeciesStats {
  species: FishSpecies
  totalCaught: number
  largestSize: number
  firstCatchDate: Date
}

export class FishCatchRepository {
  private static instance: FishCatchRepository

  private constructor() {}

  static getInstance(): FishCatchRepository {
    if (!FishCatchRepository.instance) {
      FishCatchRepository.instance = new FishCatchRepository()
    }
    return FishCatchRepository.instance
  }

  private get prisma() {
    return getPrismaClient()
  }

  async create(data: FishCatchCreateInput): Promise<FishCatch> {
    return this.prisma.fishCatch.create({
      data: {
        speciesId: data.speciesId,
        size: data.size,
        coinsEarned: data.coinsEarned,
        isFirstCatch: data.isFirstCatch,
        locationId: data.locationId,
        rodId: data.rodId,
        baitId: data.baitId || null
      }
    })
  }

  async findAllWithSpecies(): Promise<FishCatchWithSpecies[]> {
    return this.prisma.fishCatch.findMany({
      include: { species: true },
      orderBy: { caughtAt: 'desc' }
    })
  }

  async getCaughtSpeciesStats(): Promise<SpeciesStats[]> {
    const catches = await this.findAllWithSpecies()

    const speciesStats = new Map<string, SpeciesStats>()

    for (const catch_ of catches) {
      const existing = speciesStats.get(catch_.speciesId)
      if (existing) {
        existing.totalCaught++
        existing.largestSize = Math.max(existing.largestSize, catch_.size)
      } else {
        speciesStats.set(catch_.speciesId, {
          species: catch_.species,
          totalCaught: 1,
          largestSize: catch_.size,
          firstCatchDate: catch_.caughtAt
        })
      }
    }

    return Array.from(speciesStats.values())
  }

  async getCaughtSpeciesIds(): Promise<string[]> {
    const catches = await this.prisma.fishCatch.findMany({
      select: { speciesId: true },
      distinct: ['speciesId']
    })
    return catches.map((c: { speciesId: string }) => c.speciesId)
  }

  async hasBeenCaught(speciesId: string): Promise<boolean> {
    const existingCatch = await this.prisma.fishCatch.findFirst({
      where: { speciesId }
    })
    return !!existingCatch
  }
}

export const fishCatchRepository = FishCatchRepository.getInstance()
