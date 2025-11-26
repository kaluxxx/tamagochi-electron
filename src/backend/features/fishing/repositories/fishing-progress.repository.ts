import type { FishingProgress } from '@prisma/client'
import { getPrismaClient } from '../../../database/prisma'

export const FISHING_XP_CONFIG = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 500,
  firstCatchMultiplier: 2,
  xpPerLevel: 100
}

export function calculateLevel(experience: number): number {
  const xpFactor = experience / FISHING_XP_CONFIG.xpPerLevel
  const level = Math.floor((-1 + Math.sqrt(1 + 8 * xpFactor)) / 2)
  return Math.max(1, level)
}

export function calculateXpForLevel(level: number): number {
  return level * FISHING_XP_CONFIG.xpPerLevel
}

export interface ProgressUpdateInput {
  experienceIncrement?: number
  totalFishCaughtIncrement?: number
  currentStreakIncrement?: number
  resetStreak?: boolean
  largestFishId?: string
  largestFishSize?: number
  level?: number
  bestStreak?: number
}

export class FishingProgressRepository {
  private static instance: FishingProgressRepository

  private constructor() {}

  static getInstance(): FishingProgressRepository {
    if (!FishingProgressRepository.instance) {
      FishingProgressRepository.instance = new FishingProgressRepository()
    }
    return FishingProgressRepository.instance
  }

  private get prisma() {
    return getPrismaClient()
  }

  async get(): Promise<FishingProgress> {
    let progress = await this.prisma.fishingProgress.findFirst()
    if (!progress) {
      progress = await this.prisma.fishingProgress.create({
        data: { level: 1, experience: 0, totalFishCaught: 0, bestStreak: 0 }
      })
    }
    return progress
  }

  async update(data: ProgressUpdateInput): Promise<FishingProgress> {
    const progress = await this.get()

    return this.prisma.fishingProgress.update({
      where: { id: progress.id },
      data: {
        ...(data.experienceIncrement !== undefined && { experience: { increment: data.experienceIncrement } }),
        ...(data.totalFishCaughtIncrement !== undefined && { totalFishCaught: { increment: data.totalFishCaughtIncrement } }),
        ...(data.currentStreakIncrement !== undefined && { currentStreak: { increment: data.currentStreakIncrement } }),
        ...(data.resetStreak && { currentStreak: 0 }),
        ...(data.largestFishId !== undefined && { largestFishId: data.largestFishId }),
        ...(data.largestFishSize !== undefined && { largestFishSize: data.largestFishSize }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.bestStreak !== undefined && { bestStreak: data.bestStreak })
      }
    })
  }

  async resetStreak(): Promise<FishingProgress> {
    const progress = await this.get()
    return this.prisma.fishingProgress.update({
      where: { id: progress.id },
      data: { currentStreak: 0 }
    })
  }
}

export const fishingProgressRepository = FishingProgressRepository.getInstance()
