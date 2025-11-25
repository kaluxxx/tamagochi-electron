import { getPrismaClient } from '@/electron/database/prisma'
import { getWallet } from './economy.service'

// ============== MINIGAME SCORES ==============

export const saveMinigameScore = async (gameType: string, score: number, coinsEarned: number) => {
  const prisma = getPrismaClient()
  const wallet = await getWallet()

  // Transaction: save score and add coins to wallet
  const [savedScore, updatedWallet] = await prisma.$transaction([
    prisma.minigameScore.create({
      data: { gameType, score, coinsEarned }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { increment: coinsEarned } }
    })
  ])

  return { score: savedScore, wallet: updatedWallet }
}

export const getMinigameHighScores = async (gameType: string, limit: number = 10) => {
  return getPrismaClient().minigameScore.findMany({
    where: { gameType },
    orderBy: { score: 'desc' },
    take: limit
  })
}

// ============== CLICKER UPGRADES ==============

export const CLICKER_UPGRADE_CONFIG = {
  multiplier: {
    baseCost: 50,
    costMultiplier: 1.5,
    baseEffect: 1,
    effectPerLevel: 0.5,
    displayName: 'Multiplicateur',
    description: 'Multiplie les pieces gagnees',
    icon: '/sprites/upgrades/multiplier.svg'
  },
  time_bonus: {
    baseCost: 30,
    costMultiplier: 1.4,
    baseEffect: 10,
    effectPerLevel: 5,
    displayName: 'Temps Bonus',
    description: '+5 secondes par niveau',
    icon: '/sprites/upgrades/time.svg'
  },
  auto_clicker: {
    baseCost: 100,
    costMultiplier: 1.8,
    baseEffect: 0,
    effectPerLevel: 1,
    displayName: 'Auto-Clicker',
    description: '+1 clic auto par seconde',
    icon: '/sprites/upgrades/auto.svg'
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

export const getClickerUpgrades = async () => {
  const prisma = getPrismaClient()
  const types: UpgradeType[] = ['multiplier', 'time_bonus', 'auto_clicker']

  return Promise.all(types.map(async (type) => {
    let upgrade = await prisma.clickerUpgrade.findUnique({ where: { type } })
    if (!upgrade) {
      upgrade = await prisma.clickerUpgrade.create({ data: { type, level: 0 } })
    }
    return upgrade
  }))
}

export const getClickerUpgradeByType = async (type: UpgradeType) => {
  const prisma = getPrismaClient()
  let upgrade = await prisma.clickerUpgrade.findUnique({ where: { type } })
  if (!upgrade) {
    upgrade = await prisma.clickerUpgrade.create({ data: { type, level: 0 } })
  }
  return upgrade
}

export const purchaseClickerUpgrade = async (type: UpgradeType) => {
  const prisma = getPrismaClient()

  const upgrade = await getClickerUpgradeByType(type)
  const cost = calculateUpgradeCost(type, upgrade.level)
  const wallet = await getWallet()

  if (wallet.coins < cost) {
    throw new Error('INSUFFICIENT_FUNDS')
  }

  const [updatedWallet, updatedUpgrade] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { decrement: cost } }
    }),
    prisma.clickerUpgrade.update({
      where: { type },
      data: { level: { increment: 1 } }
    })
  ])

  return { wallet: updatedWallet, upgrade: updatedUpgrade, cost }
}

export const getClickerGameStats = async () => {
  const upgrades = await getClickerUpgrades()

  const getLevel = (upgradeType: UpgradeType) =>
    upgrades.find(u => u.type === upgradeType)?.level || 0

  return {
    multiplier: calculateUpgradeEffect('multiplier', getLevel('multiplier')),
    gameDuration: calculateUpgradeEffect('time_bonus', getLevel('time_bonus')),
    autoClicksPerSecond: calculateUpgradeEffect('auto_clicker', getLevel('auto_clicker'))
  }
}
