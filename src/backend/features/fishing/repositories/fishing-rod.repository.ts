import type { FishingRod } from '@/generated/prisma'
import { getPrismaClient } from '../../../database/prisma'

export class FishingRodRepository {
  private static instance: FishingRodRepository

  private constructor() {}

  static getInstance(): FishingRodRepository {
    if (!FishingRodRepository.instance) {
      FishingRodRepository.instance = new FishingRodRepository()
    }
    return FishingRodRepository.instance
  }

  private get prisma() {
    return getPrismaClient()
  }

  async findAll(): Promise<FishingRod[]> {
    return this.prisma.fishingRod.findMany({
      orderBy: { tier: 'asc' }
    })
  }

  async findById(id: string): Promise<FishingRod | null> {
    return this.prisma.fishingRod.findUnique({
      where: { id }
    })
  }

  async findEquipped(): Promise<FishingRod | null> {
    return this.prisma.fishingRod.findFirst({
      where: { isEquipped: true }
    })
  }

  async purchaseTransaction(
    rodId: string,
    walletId: string,
    price: number
  ): Promise<{ wallet: { id: string; coins: number }; rod: FishingRod }> {
    const [updatedWallet, updatedRod] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { coins: { decrement: price } }
      }),
      this.prisma.fishingRod.update({
        where: { id: rodId },
        data: { isOwned: true }
      })
    ])

    return { wallet: updatedWallet, rod: updatedRod }
  }

  async equip(rodId: string): Promise<FishingRod> {
    await this.prisma.$transaction([
      this.prisma.fishingRod.updateMany({
        data: { isEquipped: false }
      }),
      this.prisma.fishingRod.update({
        where: { id: rodId },
        data: { isEquipped: true }
      })
    ])

    return (await this.findById(rodId))!
  }
}

export const fishingRodRepository = FishingRodRepository.getInstance()
