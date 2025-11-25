import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error', 'warn']
    })
  }
  return prisma
}

export async function initializeDatabase() {
  try {
    const client = getPrismaClient()
    await client.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Failed to connect to database:', error)
    throw error
  }
}

export async function closeDatabase() {
  if (prisma) {
    await prisma.$disconnect()
    console.log('Database disconnected')
  }
}

// AnimalType operations
export const getAllAnimalTypes = async () => {
  return getPrismaClient().animalType.findMany()
}

export const getAnimalTypeById = async (id: string) => {
  return getPrismaClient().animalType.findUnique({
    where: { id }
  })
}

// Animal operations
export const getAllAnimals = async () => {
  return getPrismaClient().animal.findMany({
    include: { type: true },
    orderBy: { createdAt: 'desc' }
  })
}

export const getAnimalById = async (id: string) => {
  return getPrismaClient().animal.findUnique({
    where: { id },
    include: { type: true }
  })
}

export const createAnimal = async (data: { name: string; typeId: string }) => {
  return getPrismaClient().animal.create({
    data: {
      name: data.name,
      typeId: data.typeId
    },
    include: { type: true }
  })
}

export const feedAnimal = async (id: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')

  // Capture stats before
  const statsBefore = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: animal.health,
    energy: animal.energy
  }

  // Calculate new stats
  const statsAfter = {
    hunger: Math.min(100, animal.hunger + 20),
    happiness: Math.min(100, animal.happiness + 5),
    health: animal.health,
    energy: Math.max(0, animal.energy - 5)
  }

  // Calculate coin reward
  const coinsEarned = ECONOMY_CONFIG.actionRewards.feed
  const wallet = await getWallet()

  // Transaction: update animal, record action, add coins
  const [updatedAnimal] = await prisma.$transaction([
    prisma.animal.update({
      where: { id },
      data: {
        hunger: statsAfter.hunger,
        happiness: statsAfter.happiness,
        energy: statsAfter.energy,
        updatedAt: new Date()
      },
      include: { type: true }
    }),
    prisma.action.create({
      data: {
        animalId: id,
        actionType: 'feed',
        hungerBefore: statsBefore.hunger,
        happinessBefore: statsBefore.happiness,
        healthBefore: statsBefore.health,
        energyBefore: statsBefore.energy,
        hungerAfter: statsAfter.hunger,
        happinessAfter: statsAfter.happiness,
        healthAfter: statsAfter.health,
        energyAfter: statsAfter.energy,
        coinsEarned
      }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { increment: coinsEarned } }
    })
  ])

  return { animal: updatedAnimal, coinsEarned }
}

export const playWithAnimal = async (id: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')
  if (animal.energy < 20) throw new Error('Not enough energy')

  // Capture stats before
  const statsBefore = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: animal.health,
    energy: animal.energy
  }

  // Calculate new stats
  const statsAfter = {
    hunger: Math.max(0, animal.hunger - 5),
    happiness: Math.min(100, animal.happiness + 15),
    health: animal.health,
    energy: Math.max(0, animal.energy - 10)
  }

  // Calculate coin reward
  const coinsEarned = ECONOMY_CONFIG.actionRewards.play
  const wallet = await getWallet()

  // Transaction: update animal, record action, add coins
  const [updatedAnimal] = await prisma.$transaction([
    prisma.animal.update({
      where: { id },
      data: {
        happiness: statsAfter.happiness,
        energy: statsAfter.energy,
        hunger: statsAfter.hunger,
        updatedAt: new Date()
      },
      include: { type: true }
    }),
    prisma.action.create({
      data: {
        animalId: id,
        actionType: 'play',
        hungerBefore: statsBefore.hunger,
        happinessBefore: statsBefore.happiness,
        healthBefore: statsBefore.health,
        energyBefore: statsBefore.energy,
        hungerAfter: statsAfter.hunger,
        happinessAfter: statsAfter.happiness,
        healthAfter: statsAfter.health,
        energyAfter: statsAfter.energy,
        coinsEarned
      }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { increment: coinsEarned } }
    })
  ])

  return { animal: updatedAnimal, coinsEarned }
}

export const healAnimal = async (id: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')

  // Capture stats before
  const statsBefore = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: animal.health,
    energy: animal.energy
  }

  // Calculate new stats
  const statsAfter = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: Math.min(100, animal.health + 20),
    energy: animal.energy
  }

  // Calculate coin reward
  const coinsEarned = ECONOMY_CONFIG.actionRewards.heal
  const wallet = await getWallet()

  // Transaction: update animal, record action, add coins
  const [updatedAnimal] = await prisma.$transaction([
    prisma.animal.update({
      where: { id },
      data: {
        health: statsAfter.health,
        updatedAt: new Date()
      },
      include: { type: true }
    }),
    prisma.action.create({
      data: {
        animalId: id,
        actionType: 'heal',
        hungerBefore: statsBefore.hunger,
        happinessBefore: statsBefore.happiness,
        healthBefore: statsBefore.health,
        energyBefore: statsBefore.energy,
        hungerAfter: statsAfter.hunger,
        happinessAfter: statsAfter.happiness,
        healthAfter: statsAfter.health,
        energyAfter: statsAfter.energy,
        coinsEarned
      }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { increment: coinsEarned } }
    })
  ])

  return { animal: updatedAnimal, coinsEarned }
}

export const sleepAnimal = async (id: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')
  if (animal.energy > 80) throw new Error('Not tired enough')

  // Capture stats before
  const statsBefore = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: animal.health,
    energy: animal.energy
  }

  // Calculate new stats
  const statsAfter = {
    hunger: animal.hunger,
    happiness: Math.min(100, animal.happiness + 5),
    health: animal.health,
    energy: Math.min(100, animal.energy + 30)
  }

  // Calculate coin reward
  const coinsEarned = ECONOMY_CONFIG.actionRewards.sleep
  const wallet = await getWallet()

  // Transaction: update animal, record action, add coins
  const [updatedAnimal] = await prisma.$transaction([
    prisma.animal.update({
      where: { id },
      data: {
        energy: statsAfter.energy,
        happiness: statsAfter.happiness,
        updatedAt: new Date()
      },
      include: { type: true }
    }),
    prisma.action.create({
      data: {
        animalId: id,
        actionType: 'sleep',
        hungerBefore: statsBefore.hunger,
        happinessBefore: statsBefore.happiness,
        healthBefore: statsBefore.health,
        energyBefore: statsBefore.energy,
        hungerAfter: statsAfter.hunger,
        happinessAfter: statsAfter.happiness,
        healthAfter: statsAfter.health,
        energyAfter: statsAfter.energy,
        coinsEarned
      }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { increment: coinsEarned } }
    })
  ])

  return { animal: updatedAnimal, coinsEarned }
}

export interface TickResult {
  animal: {
    id: string
    name: string
    typeId: string
    hunger: number
    happiness: number
    health: number
    energy: number
    age: number
    createdAt: Date
    updatedAt: Date
    isAlive: boolean
    type: {
      id: string
      name: string
      displayName: string
      hungerDecayRate: number
      happinessDecayRate: number
      energyDecayRate: number
      healthDecayRate: number
      emoji: string
    }
  }
  justDied: boolean
  criticalStats: {
    hunger: boolean
    happiness: boolean
    energy: boolean
    health: boolean
  }
}

export const tickAnimal = async (id: string): Promise<TickResult> => {
  const animal = await getPrismaClient().animal.findUnique({
    where: { id },
    include: { type: true }
  })
  if (!animal) throw new Error('Animal not found')

  // Calculate elapsed time
  const now = new Date()
  const lastUpdate = animal.updatedAt
  const hoursElapsed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

  // Stat degradation using type-specific rates
  const newHunger = Math.max(0, animal.hunger - hoursElapsed * animal.type.hungerDecayRate)
  const newHappiness = Math.max(0, animal.happiness - hoursElapsed * animal.type.happinessDecayRate)
  const newEnergy = Math.max(0, animal.energy - hoursElapsed * animal.type.energyDecayRate)

  // Count critical stats (< 20) for health degradation multiplier
  const criticalStatsCount = [
    newHunger < 20,
    newHappiness < 20,
    newEnergy < 20
  ].filter(Boolean).length

  // Health decreases when any stat < 20, multiplied by number of critical stats
  const newHealth = criticalStatsCount > 0
    ? Math.max(0, animal.health - hoursElapsed * animal.type.healthDecayRate * criticalStatsCount)
    : animal.health

  // Death if health = 0
  const isAlive = newHealth > 0
  const wasAlive = animal.isAlive

  const updatedAnimal = await getPrismaClient().animal.update({
    where: { id },
    data: {
      hunger: newHunger,
      happiness: newHappiness,
      energy: newEnergy,
      health: newHealth,
      isAlive,
      age: animal.age + hoursElapsed,
      updatedAt: now
    },
    include: { type: true }
  })

  return {
    animal: updatedAnimal,
    justDied: wasAlive && !isAlive,
    criticalStats: {
      hunger: newHunger < 30,
      happiness: newHappiness < 30,
      energy: newEnergy < 30,
      health: newHealth < 30
    }
  }
}

// Action operations
export const getActionsByAnimalId = async (animalId: string) => {
  return getPrismaClient().action.findMany({
    where: { animalId },
    include: { item: true },
    orderBy: { timestamp: 'desc' },
    take: 20
  })
}

export const recordAction = async (animalId: string, actionType: string, itemId?: string) => {
  return getPrismaClient().action.create({
    data: {
      animalId,
      actionType,
      itemId
    },
    include: { item: true }
  })
}

// Item operations
export const getAllItems = async () => {
  return getPrismaClient().item.findMany()
}

export const getItemById = async (id: string) => {
  return getPrismaClient().item.findUnique({
    where: { id }
  })
}

export const getItemsByType = async (type: string) => {
  return getPrismaClient().item.findMany({
    where: { type }
  })
}

export const useItem = async (animalId: string, itemId: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id: animalId } })
  const item = await prisma.item.findUnique({ where: { id: itemId } })
  const inventoryEntry = await prisma.inventory.findUnique({ where: { itemId } })

  if (!animal) throw new Error('Animal not found')
  if (!item) throw new Error('Item not found')
  if (!inventoryEntry || inventoryEntry.quantity <= 0) throw new Error('Item out of stock')
  if (animal.energy < item.energyCost) throw new Error('NOT_ENOUGH_ENERGY')

  // Capture stats before
  const statsBefore = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: animal.health,
    energy: animal.energy
  }

  // Calculate new stats
  const statsAfter = {
    hunger: Math.min(100, animal.hunger + item.hungerBoost),
    happiness: Math.min(100, animal.happiness + item.happinessBoost),
    health: Math.min(100, animal.health + item.healthBoost),
    energy: Math.max(0, animal.energy + item.energyBoost - item.energyCost)
  }

  // Calculate coin reward
  const coinsEarned = ECONOMY_CONFIG.actionRewards.use_item
  const wallet = await getWallet()

  // Transaction: update animal, decrement inventory, record action, add coins
  const [updatedAnimal] = await prisma.$transaction([
    prisma.animal.update({
      where: { id: animalId },
      data: {
        ...statsAfter,
        updatedAt: new Date()
      },
      include: { type: true }
    }),
    prisma.inventory.update({
      where: { itemId },
      data: { quantity: { decrement: 1 } }
    }),
    prisma.action.create({
      data: {
        animalId,
        actionType: 'use_item',
        itemId,
        hungerBefore: statsBefore.hunger,
        happinessBefore: statsBefore.happiness,
        healthBefore: statsBefore.health,
        energyBefore: statsBefore.energy,
        hungerAfter: statsAfter.hunger,
        happinessAfter: statsAfter.happiness,
        healthAfter: statsAfter.health,
        energyAfter: statsAfter.energy,
        coinsEarned
      }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { increment: coinsEarned } }
    })
  ])

  return { animal: updatedAnimal, coinsEarned }
}

// Inventory operations
export const getInventory = async () => {
  return getPrismaClient().inventory.findMany({
    include: { item: true },
    orderBy: { item: { type: 'asc' } }
  })
}

export const getInventoryByType = async (type: string) => {
  return getPrismaClient().inventory.findMany({
    where: { item: { type } },
    include: { item: true }
  })
}

// Action history with stats delta
export const getActionHistory = async (animalId: string, limit = 20) => {
  return getPrismaClient().action.findMany({
    where: { animalId },
    include: { item: true },
    orderBy: { timestamp: 'desc' },
    take: limit
  })
}

// ============== ECONOMY SYSTEM ==============

// Economy configuration
const ECONOMY_CONFIG = {
  passiveGainRate: 10, // Coins per hour
  actionRewards: {
    feed: 2,
    play: 5,
    heal: 3,
    sleep: 8,
    use_item: 1
  } as Record<string, number>
}

// Wallet operations
export const getWallet = async () => {
  const prisma = getPrismaClient()
  let wallet = await prisma.wallet.findFirst()

  // Create wallet if it doesn't exist
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        coins: 100,
        lastPassiveGain: new Date()
      }
    })
  }

  return wallet
}

export const collectPassiveGains = async () => {
  const prisma = getPrismaClient()
  const wallet = await getWallet()

  const now = new Date()
  const hoursElapsed = (now.getTime() - wallet.lastPassiveGain.getTime()) / (1000 * 60 * 60)
  const coinsEarned = Math.floor(hoursElapsed * ECONOMY_CONFIG.passiveGainRate)

  if (coinsEarned > 0) {
    return prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        coins: { increment: coinsEarned },
        lastPassiveGain: now
      }
    })
  }

  return wallet
}

export const addCoins = async (amount: number) => {
  const wallet = await getWallet()
  return getPrismaClient().wallet.update({
    where: { id: wallet.id },
    data: { coins: { increment: amount } }
  })
}

export const spendCoins = async (amount: number) => {
  const wallet = await getWallet()
  if (wallet.coins < amount) {
    throw new Error('INSUFFICIENT_FUNDS')
  }
  return getPrismaClient().wallet.update({
    where: { id: wallet.id },
    data: { coins: { decrement: amount } }
  })
}

export const getActionReward = (actionType: string): number => {
  return ECONOMY_CONFIG.actionRewards[actionType] || 0
}

// Shop operations
export const getShopItems = async () => {
  return getPrismaClient().item.findMany({
    orderBy: [{ type: 'asc' }, { price: 'asc' }]
  })
}

export const purchaseItem = async (itemId: string, quantity: number = 1) => {
  const prisma = getPrismaClient()
  const item = await prisma.item.findUnique({ where: { id: itemId } })
  if (!item) throw new Error('Item not found')

  const totalCost = item.price * quantity
  const wallet = await getWallet()

  if (wallet.coins < totalCost) {
    throw new Error('INSUFFICIENT_FUNDS')
  }

  // Transaction: deduct coins + add to inventory
  const [updatedWallet, updatedInventory] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { decrement: totalCost } }
    }),
    prisma.inventory.upsert({
      where: { itemId },
      update: { quantity: { increment: quantity } },
      create: { itemId, quantity },
      include: { item: true }
    })
  ])

  return { wallet: updatedWallet, inventory: updatedInventory, item }
}

// Minigame operations
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

// ============== CLICKER UPGRADES SYSTEM ==============

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
