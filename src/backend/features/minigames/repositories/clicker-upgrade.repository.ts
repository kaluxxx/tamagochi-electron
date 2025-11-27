import type { ClickerUpgrade } from '@/generated/prisma'
import { getPrismaClient } from '../../../database/prisma'

export const CLICKER_UPGRADE_CONFIG = {
  multiplier: {
    baseCost: 50,
    costMultiplier: 1.5,
    baseEffect: 1,
    effectPerLevel: 0.5
  },
  time_bonus: {
    baseCost: 30,
    costMultiplier: 1.4,
    baseEffect: 10,
    effectPerLevel: 5
  },
  auto_clicker: {
    baseCost: 100,
    costMultiplier: 1.8,
    baseEffect: 0,
    effectPerLevel: 1
  }
} as const

export type UpgradeType = keyof typeof CLICKER_UPGRADE_CONFIG

export function calculateUpgradeCost(type: UpgradeType, currentLevel: number): number {
  const config = CLICKER_UPGRADE_CONFIG[type]
  return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel))
}

export function calculateUpgradeEffect(type: UpgradeType, level: number): number {
  const config = CLICKER_UPGRADE_CONFIG[type]
  return config.baseEffect + (config.effectPerLevel * level)
}

export class ClickerUpgradeRepository {
  private static instance: ClickerUpgradeRepository

  private constructor() {}

  static getInstance(): ClickerUpgradeRepository {
    if (!ClickerUpgradeRepository.instance) {
      ClickerUpgradeRepository.instance = new ClickerUpgradeRepository()
    }
    return ClickerUpgradeRepository.instance
  }

  private get prisma() {
    return getPrismaClient()
  }

  async findAll(): Promise<ClickerUpgrade[]> {
    const types: UpgradeType[] = ['multiplier', 'time_bonus', 'auto_clicker']

    return Promise.all(types.map(async (type) => {
      let upgrade = await this.prisma.clickerUpgrade.findUnique({ where: { type } })
      if (!upgrade) {
        upgrade = await this.prisma.clickerUpgrade.create({ data: { type, level: 0 } })
      }
      return upgrade
    }))
  }

  async findByType(type: UpgradeType): Promise<ClickerUpgrade> {
    let upgrade = await this.prisma.clickerUpgrade.findUnique({ where: { type } })
    if (!upgrade) {
      upgrade = await this.prisma.clickerUpgrade.create({ data: { type, level: 0 } })
    }
    return upgrade
  }

  async purchaseTransaction(
    type: UpgradeType,
    cost: number,
    walletId: string
  ): Promise<{ wallet: { id: string; coins: number }; upgrade: ClickerUpgrade }> {
    const [updatedWallet, updatedUpgrade] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { coins: { decrement: cost } }
      }),
      this.prisma.clickerUpgrade.update({
        where: { type },
        data: { level: { increment: 1 } }
      })
    ])

    return { wallet: updatedWallet, upgrade: updatedUpgrade }
  }
}

export const clickerUpgradeRepository = ClickerUpgradeRepository.getInstance()
