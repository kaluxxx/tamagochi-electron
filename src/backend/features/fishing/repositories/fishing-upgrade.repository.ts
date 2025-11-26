import type { FishingUpgrade } from '@prisma/client'
import { getPrismaClient } from '../../../database/prisma'

export const FISHING_UPGRADE_CONFIG = {
  luck: {
    baseCost: 100,
    costMultiplier: 1.6,
    baseEffect: 0,
    effectPerLevel: 5,
    displayName: 'Chanceux',
    description: '+5% chance poissons rares par niveau',
    icon: '/sprites/fishing/upgrades/luck.svg'
  },
  reflexes: {
    baseCost: 75,
    costMultiplier: 1.5,
    baseEffect: 0,
    effectPerLevel: 0.1,
    displayName: 'Réflexes',
    description: '+0.1s temps de réaction par niveau',
    icon: '/sprites/fishing/upgrades/reflexes.svg'
  },
  value: {
    baseCost: 80,
    costMultiplier: 1.4,
    baseEffect: 0,
    effectPerLevel: 10,
    displayName: 'Marchand',
    description: '+10% valeur des poissons par niveau',
    icon: '/sprites/fishing/upgrades/value.svg'
  },
  bait_efficiency: {
    baseCost: 150,
    costMultiplier: 1.7,
    baseEffect: 0,
    effectPerLevel: 1,
    displayName: 'Maître Appât',
    description: '+1 utilisation par appât par niveau',
    icon: '/sprites/fishing/upgrades/bait.svg'
  }
} as const

export type FishingUpgradeType = keyof typeof FISHING_UPGRADE_CONFIG

export function calculateFishingUpgradeCost(type: FishingUpgradeType, currentLevel: number): number {
  const config = FISHING_UPGRADE_CONFIG[type]
  return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel))
}

export function calculateFishingUpgradeEffect(type: FishingUpgradeType, level: number): number {
  const config = FISHING_UPGRADE_CONFIG[type]
  return config.baseEffect + (config.effectPerLevel * level)
}

export class FishingUpgradeRepository {
  private static instance: FishingUpgradeRepository

  private constructor() {}

  static getInstance(): FishingUpgradeRepository {
    if (!FishingUpgradeRepository.instance) {
      FishingUpgradeRepository.instance = new FishingUpgradeRepository()
    }
    return FishingUpgradeRepository.instance
  }

  private get prisma() {
    return getPrismaClient()
  }

  async findAll(): Promise<FishingUpgrade[]> {
    const types: FishingUpgradeType[] = ['luck', 'reflexes', 'value', 'bait_efficiency']

    return Promise.all(types.map(async (type) => {
      let upgrade = await this.prisma.fishingUpgrade.findUnique({ where: { type } })
      if (!upgrade) {
        upgrade = await this.prisma.fishingUpgrade.create({ data: { type, level: 0 } })
      }
      return upgrade
    }))
  }

  async findByType(type: FishingUpgradeType): Promise<FishingUpgrade> {
    let upgrade = await this.prisma.fishingUpgrade.findUnique({ where: { type } })
    if (!upgrade) {
      upgrade = await this.prisma.fishingUpgrade.create({ data: { type, level: 0 } })
    }
    return upgrade
  }

  async purchaseTransaction(
    type: FishingUpgradeType,
    cost: number,
    walletId: string
  ): Promise<{ wallet: { id: string; coins: number }; upgrade: FishingUpgrade }> {
    const [updatedWallet, updatedUpgrade] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { coins: { decrement: cost } }
      }),
      this.prisma.fishingUpgrade.update({
        where: { type },
        data: { level: { increment: 1 } }
      })
    ])

    return { wallet: updatedWallet, upgrade: updatedUpgrade }
  }
}

export const fishingUpgradeRepository = FishingUpgradeRepository.getInstance()
