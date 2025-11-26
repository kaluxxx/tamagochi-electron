import type { FishingBait } from '@prisma/client'
import { getPrismaClient } from '../../../database/prisma'

export class FishingBaitRepository {
  private static instance: FishingBaitRepository

  private constructor() {}

  static getInstance(): FishingBaitRepository {
    if (!FishingBaitRepository.instance) {
      FishingBaitRepository.instance = new FishingBaitRepository()
    }
    return FishingBaitRepository.instance
  }

  private get prisma() {
    return getPrismaClient()
  }

  async findAll(): Promise<FishingBait[]> {
    return this.prisma.fishingBait.findMany({
      orderBy: { price: 'asc' }
    })
  }

  async findById(id: string): Promise<FishingBait | null> {
    return this.prisma.fishingBait.findUnique({
      where: { id }
    })
  }

  async purchaseTransaction(
    baitId: string,
    quantity: number,
    walletId: string,
    totalCost: number
  ): Promise<{ wallet: { id: string; coins: number }; bait: FishingBait }> {
    const [updatedWallet, updatedBait] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { coins: { decrement: totalCost } }
      }),
      this.prisma.fishingBait.update({
        where: { id: baitId },
        data: { quantity: { increment: quantity } }
      })
    ])

    return { wallet: updatedWallet, bait: updatedBait }
  }

  async consumeOne(baitId: string): Promise<FishingBait> {
    return this.prisma.fishingBait.update({
      where: { id: baitId },
      data: { quantity: { decrement: 1 } }
    })
  }
}

export const fishingBaitRepository = FishingBaitRepository.getInstance()
