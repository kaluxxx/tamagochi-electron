import type { FishingLocation } from '@/generated/prisma'
import { getPrismaClient } from '../../../database/prisma'

export class FishingLocationRepository {
  private static instance: FishingLocationRepository

  private constructor() {}

  static getInstance(): FishingLocationRepository {
    if (!FishingLocationRepository.instance) {
      FishingLocationRepository.instance = new FishingLocationRepository()
    }
    return FishingLocationRepository.instance
  }

  private get prisma() {
    return getPrismaClient()
  }

  async findAll(): Promise<FishingLocation[]> {
    return this.prisma.fishingLocation.findMany({
      orderBy: { unlockOrder: 'asc' }
    })
  }

  async findById(id: string): Promise<FishingLocation | null> {
    return this.prisma.fishingLocation.findUnique({
      where: { id }
    })
  }

  async unlockTransaction(
    locationId: string,
    walletId: string,
    unlockCost: number
  ): Promise<{ wallet: { id: string; coins: number }; location: FishingLocation }> {
    const [updatedWallet, updatedLocation] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { coins: { decrement: unlockCost } }
      }),
      this.prisma.fishingLocation.update({
        where: { id: locationId },
        data: { isUnlocked: true }
      })
    ])

    return { wallet: updatedWallet, location: updatedLocation }
  }
}

export const fishingLocationRepository = FishingLocationRepository.getInstance()
