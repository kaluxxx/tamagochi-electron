import { getPrismaClient } from '../database/prisma'
import { getWallet } from './economy.service'

// ============== FISHING UPGRADE CONFIG ==============

export const FISHING_UPGRADE_CONFIG = {
  luck: {
    baseCost: 100,
    costMultiplier: 1.6,
    baseEffect: 0,
    effectPerLevel: 5, // +5% rare fish chance per level
    displayName: 'Chanceux',
    description: '+5% chance poissons rares par niveau',
    icon: '/sprites/fishing/upgrades/luck.svg'
  },
  reflexes: {
    baseCost: 75,
    costMultiplier: 1.5,
    baseEffect: 0,
    effectPerLevel: 0.1, // +0.1s reaction window per level
    displayName: 'Réflexes',
    description: '+0.1s temps de réaction par niveau',
    icon: '/sprites/fishing/upgrades/reflexes.svg'
  },
  value: {
    baseCost: 80,
    costMultiplier: 1.4,
    baseEffect: 0,
    effectPerLevel: 10, // +10% coin value per level
    displayName: 'Marchand',
    description: '+10% valeur des poissons par niveau',
    icon: '/sprites/fishing/upgrades/value.svg'
  },
  bait_efficiency: {
    baseCost: 150,
    costMultiplier: 1.7,
    baseEffect: 0,
    effectPerLevel: 1, // +1 extra use per bait per level
    displayName: 'Maître Appât',
    description: '+1 utilisation par appât par niveau',
    icon: '/sprites/fishing/upgrades/bait.svg'
  }
} as const

export type FishingUpgradeType = keyof typeof FISHING_UPGRADE_CONFIG

// ============== XP CONFIG ==============

export const FISHING_XP_CONFIG = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 500,
  firstCatchMultiplier: 2,
  xpPerLevel: 100, // XP needed per level (level * xpPerLevel)
}

// ============== HELPER FUNCTIONS ==============

export function calculateFishingUpgradeCost(type: FishingUpgradeType, currentLevel: number): number {
  const config = FISHING_UPGRADE_CONFIG[type]
  return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel))
}

export function calculateFishingUpgradeEffect(type: FishingUpgradeType, level: number): number {
  const config = FISHING_UPGRADE_CONFIG[type]
  return config.baseEffect + (config.effectPerLevel * level)
}

export function calculateXpForLevel(level: number): number {
  return level * FISHING_XP_CONFIG.xpPerLevel
}

// ============== FISH SPECIES ==============

export const getAllFishSpecies = async () => {
  return getPrismaClient().fishSpecies.findMany({
    orderBy: [
      { rarity: 'asc' },
      { name: 'asc' }
    ]
  })
}

export const getFishSpeciesById = async (id: string) => {
  return getPrismaClient().fishSpecies.findUnique({
    where: { id }
  })
}

export const getFishSpeciesByName = async (name: string) => {
  return getPrismaClient().fishSpecies.findUnique({
    where: { name }
  })
}

// ============== FISH CATCHES (CATALOG) ==============

export const getCaughtFish = async () => {
  const prisma = getPrismaClient()

  // Get unique species that have been caught
  const catches = await prisma.fishCatch.findMany({
    include: { species: true },
    orderBy: { caughtAt: 'desc' }
  })

  // Group by species and get stats
  const speciesStats = new Map<string, {
    species: typeof catches[0]['species'],
    totalCaught: number,
    largestSize: number,
    firstCatchDate: Date
  }>()

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

export const getCaughtSpeciesIds = async () => {
  const prisma = getPrismaClient()
  const catches = await prisma.fishCatch.findMany({
    select: { speciesId: true },
    distinct: ['speciesId']
  })
  return catches.map(c => c.speciesId)
}

export const isFirstCatch = async (speciesId: string) => {
  const prisma = getPrismaClient()
  const existingCatch = await prisma.fishCatch.findFirst({
    where: { speciesId }
  })
  return !existingCatch
}

// ============== CATCH FISH ==============

export const catchFish = async (
  speciesId: string,
  size: number,
  locationId: string,
  rodId: string,
  baitId?: string
) => {
  const prisma = getPrismaClient()

  // Get fish species for value calculation
  const species = await getFishSpeciesById(speciesId)
  if (!species) throw new Error('SPECIES_NOT_FOUND')

  // Check if first catch
  const firstCatch = await isFirstCatch(speciesId)

  // Get upgrades for value multiplier
  const stats = await getFishingStats()
  const valueMultiplier = 1 + (stats.valueBonus / 100)

  // Calculate coins earned
  let baseCoins = species.baseValue

  // Size bonus (larger fish = more coins)
  const sizeRatio = size / species.maxSize
  const sizeBonus = Math.floor(baseCoins * sizeRatio * 0.5)
  baseCoins += sizeBonus

  // Apply value upgrade multiplier
  baseCoins = Math.floor(baseCoins * valueMultiplier)

  // First catch bonus (3x)
  if (firstCatch) {
    baseCoins *= 3
  }

  // Calculate XP earned
  const rarityXp = FISHING_XP_CONFIG[species.rarity as keyof typeof FISHING_XP_CONFIG] || 10
  let xpEarned = rarityXp
  if (firstCatch) {
    xpEarned *= FISHING_XP_CONFIG.firstCatchMultiplier
  }

  const wallet = await getWallet()
  const progress = await getFishingProgress()

  // Create catch record
  const fishCatch = await prisma.fishCatch.create({
    data: {
      speciesId,
      size,
      coinsEarned: baseCoins,
      isFirstCatch: firstCatch,
      locationId,
      rodId,
      baitId: baitId || null
    }
  })

  // Update wallet
  const updatedWallet = await prisma.wallet.update({
    where: { id: wallet.id },
    data: { coins: { increment: baseCoins } }
  })

  // Update progress
  const updatedProgress = await prisma.fishingProgress.update({
    where: { id: progress.id },
    data: {
      experience: { increment: xpEarned },
      totalFishCaught: { increment: 1 },
      currentStreak: { increment: 1 },
      // Update largest fish if applicable
      ...(size > (progress.largestFishSize || 0) ? {
        largestFishId: speciesId,
        largestFishSize: size
      } : {})
    }
  })

  // Consume bait if used
  if (baitId) {
    await prisma.fishingBait.update({
      where: { id: baitId },
      data: { quantity: { decrement: 1 } }
    })
  }

  // Check for level up
  const newLevel = calculateLevel(updatedProgress.experience)
  if (newLevel > updatedProgress.level) {
    await prisma.fishingProgress.update({
      where: { id: progress.id },
      data: { level: newLevel }
    })
  }

  // Update best streak if needed
  if (updatedProgress.currentStreak > updatedProgress.bestStreak) {
    await prisma.fishingProgress.update({
      where: { id: progress.id },
      data: { bestStreak: updatedProgress.currentStreak }
    })
  }

  return {
    catch: fishCatch,
    wallet: updatedWallet,
    progress: await getFishingProgress(),
    species,
    coinsEarned: baseCoins,
    xpEarned,
    isFirstCatch: firstCatch
  }
}

export const failCatch = async () => {
  const prisma = getPrismaClient()
  const progress = await getFishingProgress()

  // Reset streak on failed catch
  await prisma.fishingProgress.update({
    where: { id: progress.id },
    data: { currentStreak: 0 }
  })

  return { progress: await getFishingProgress() }
}

function calculateLevel(experience: number): number {
  // Level formula: each level needs (level * 100) XP
  // Total XP for level N = sum(1..N) * 100 = N*(N+1)/2 * 100
  // So we solve: N*(N+1)/2 * 100 <= experience
  // N^2 + N - 2*experience/100 <= 0
  // Using quadratic formula:
  const xpFactor = experience / FISHING_XP_CONFIG.xpPerLevel
  const level = Math.floor((-1 + Math.sqrt(1 + 8 * xpFactor)) / 2)
  return Math.max(1, level)
}

// ============== FISHING RODS ==============

export const getFishingRods = async () => {
  return getPrismaClient().fishingRod.findMany({
    orderBy: { tier: 'asc' }
  })
}

export const getEquippedRod = async () => {
  return getPrismaClient().fishingRod.findFirst({
    where: { isEquipped: true }
  })
}

export const purchaseRod = async (rodId: string) => {
  const prisma = getPrismaClient()

  const rod = await prisma.fishingRod.findUnique({ where: { id: rodId } })
  if (!rod) throw new Error('ROD_NOT_FOUND')
  if (rod.isOwned) throw new Error('ROD_ALREADY_OWNED')

  const wallet = await getWallet()
  if (wallet.coins < rod.price) throw new Error('INSUFFICIENT_FUNDS')

  const [updatedWallet, updatedRod] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { decrement: rod.price } }
    }),
    prisma.fishingRod.update({
      where: { id: rodId },
      data: { isOwned: true }
    })
  ])

  return { wallet: updatedWallet, rod: updatedRod }
}

export const equipRod = async (rodId: string) => {
  const prisma = getPrismaClient()

  const rod = await prisma.fishingRod.findUnique({ where: { id: rodId } })
  if (!rod) throw new Error('ROD_NOT_FOUND')
  if (!rod.isOwned) throw new Error('ROD_NOT_OWNED')

  // Unequip all rods, then equip the selected one
  await prisma.$transaction([
    prisma.fishingRod.updateMany({
      data: { isEquipped: false }
    }),
    prisma.fishingRod.update({
      where: { id: rodId },
      data: { isEquipped: true }
    })
  ])

  return prisma.fishingRod.findUnique({ where: { id: rodId } })
}

// ============== FISHING BAITS ==============

export const getFishingBaits = async () => {
  return getPrismaClient().fishingBait.findMany({
    orderBy: { price: 'asc' }
  })
}

export const purchaseBait = async (baitId: string, quantity: number) => {
  const prisma = getPrismaClient()

  const bait = await prisma.fishingBait.findUnique({ where: { id: baitId } })
  if (!bait) throw new Error('BAIT_NOT_FOUND')

  const totalCost = bait.price * quantity
  const wallet = await getWallet()
  if (wallet.coins < totalCost) throw new Error('INSUFFICIENT_FUNDS')

  const [updatedWallet, updatedBait] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { decrement: totalCost } }
    }),
    prisma.fishingBait.update({
      where: { id: baitId },
      data: { quantity: { increment: quantity } }
    })
  ])

  return { wallet: updatedWallet, bait: updatedBait, cost: totalCost }
}

// ============== FISHING LOCATIONS ==============

export const getFishingLocations = async () => {
  return getPrismaClient().fishingLocation.findMany({
    orderBy: { unlockOrder: 'asc' }
  })
}

export const unlockLocation = async (locationId: string) => {
  const prisma = getPrismaClient()

  const location = await prisma.fishingLocation.findUnique({ where: { id: locationId } })
  if (!location) throw new Error('LOCATION_NOT_FOUND')
  if (location.isUnlocked) throw new Error('LOCATION_ALREADY_UNLOCKED')

  const wallet = await getWallet()
  if (wallet.coins < location.unlockCost) throw new Error('INSUFFICIENT_FUNDS')

  const [updatedWallet, updatedLocation] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { decrement: location.unlockCost } }
    }),
    prisma.fishingLocation.update({
      where: { id: locationId },
      data: { isUnlocked: true }
    })
  ])

  return { wallet: updatedWallet, location: updatedLocation }
}

// ============== FISHING UPGRADES ==============

export const getFishingUpgrades = async () => {
  const prisma = getPrismaClient()
  const types: FishingUpgradeType[] = ['luck', 'reflexes', 'value', 'bait_efficiency']

  return Promise.all(types.map(async (type) => {
    let upgrade = await prisma.fishingUpgrade.findUnique({ where: { type } })
    if (!upgrade) {
      upgrade = await prisma.fishingUpgrade.create({ data: { type, level: 0 } })
    }
    return upgrade
  }))
}

export const getFishingUpgradeByType = async (type: FishingUpgradeType) => {
  const prisma = getPrismaClient()
  let upgrade = await prisma.fishingUpgrade.findUnique({ where: { type } })
  if (!upgrade) {
    upgrade = await prisma.fishingUpgrade.create({ data: { type, level: 0 } })
  }
  return upgrade
}

export const purchaseFishingUpgrade = async (type: FishingUpgradeType) => {
  const prisma = getPrismaClient()

  const upgrade = await getFishingUpgradeByType(type)
  const cost = calculateFishingUpgradeCost(type, upgrade.level)
  const wallet = await getWallet()

  if (wallet.coins < cost) {
    throw new Error('INSUFFICIENT_FUNDS')
  }

  const [updatedWallet, updatedUpgrade] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { decrement: cost } }
    }),
    prisma.fishingUpgrade.update({
      where: { type },
      data: { level: { increment: 1 } }
    })
  ])

  return { wallet: updatedWallet, upgrade: updatedUpgrade, cost }
}

export const getFishingStats = async () => {
  const upgrades = await getFishingUpgrades()

  const getLevel = (upgradeType: FishingUpgradeType) =>
    upgrades.find(u => u.type === upgradeType)?.level || 0

  return {
    luckBonus: calculateFishingUpgradeEffect('luck', getLevel('luck')),
    reflexBonus: calculateFishingUpgradeEffect('reflexes', getLevel('reflexes')),
    valueBonus: calculateFishingUpgradeEffect('value', getLevel('value')),
    baitEfficiencyBonus: calculateFishingUpgradeEffect('bait_efficiency', getLevel('bait_efficiency'))
  }
}

export const getFishingUpgradesWithDetails = async () => {
  const upgrades = await getFishingUpgrades()
  const types: FishingUpgradeType[] = ['luck', 'reflexes', 'value', 'bait_efficiency']

  return types.map(type => {
    const upgrade = upgrades.find(u => u.type === type)!
    const config = FISHING_UPGRADE_CONFIG[type]
    const currentEffect = calculateFishingUpgradeEffect(type, upgrade.level)
    const nextEffect = calculateFishingUpgradeEffect(type, upgrade.level + 1)
    const cost = calculateFishingUpgradeCost(type, upgrade.level)

    return {
      type,
      level: upgrade.level,
      displayName: config.displayName,
      description: config.description,
      currentEffect,
      nextEffect,
      effectPerLevel: config.effectPerLevel,
      cost,
    }
  })
}

// ============== FISHING PROGRESS ==============

export const getFishingProgress = async () => {
  const prisma = getPrismaClient()
  let progress = await prisma.fishingProgress.findFirst()
  if (!progress) {
    progress = await prisma.fishingProgress.create({
      data: { level: 1, experience: 0, totalFishCaught: 0, bestStreak: 0 }
    })
  }
  return progress
}

// ============== FISH SELECTION (for game) ==============

export const selectRandomFish = async (locationId: string, baitId?: string) => {
  const prisma = getPrismaClient()

  // Get location
  const location = await prisma.fishingLocation.findUnique({ where: { id: locationId } })
  if (!location) throw new Error('LOCATION_NOT_FOUND')

  // Get available fish for this location
  const availableFishIds = JSON.parse(location.availableFish) as string[]
  const availableFish = await prisma.fishSpecies.findMany({
    where: { id: { in: availableFishIds } }
  })

  if (availableFish.length === 0) throw new Error('NO_FISH_AVAILABLE')

  // Get bait preferences
  let bait = null
  if (baitId) {
    bait = await prisma.fishingBait.findUnique({ where: { id: baitId } })
  }

  // Get upgrades for luck bonus
  const stats = await getFishingStats()

  // Build weighted fish list
  const weightedFish: { fish: typeof availableFish[0], weight: number }[] = []

  for (const fish of availableFish) {
    let weight = getBaseWeightByRarity(fish.rarity)

    // Apply luck bonus to rare+ fish
    if (['rare', 'epic', 'legendary'].includes(fish.rarity)) {
      weight *= (1 + stats.luckBonus / 100)
    }

    // Apply bait preference bonus
    if (bait) {
      const baitPrefs = JSON.parse(fish.baitPreference) as string[]
      if (baitPrefs.includes(bait.name)) {
        weight *= 2 // Double chance if preferred bait
      }

      // Check if bait targets this rarity
      if (bait.targetRarity) {
        const targetRarities = JSON.parse(bait.targetRarity) as string[]
        if (targetRarities.includes(fish.rarity)) {
          weight *= 1.5
        }
      }
    }

    weightedFish.push({ fish, weight })
  }

  // Select random fish based on weights
  const totalWeight = weightedFish.reduce((sum, wf) => sum + wf.weight, 0)
  let random = Math.random() * totalWeight

  for (const wf of weightedFish) {
    random -= wf.weight
    if (random <= 0) {
      // Generate random size
      const size = Math.floor(
        wf.fish.minSize + Math.random() * (wf.fish.maxSize - wf.fish.minSize)
      )
      return { species: wf.fish, size }
    }
  }

  // Fallback to first fish
  const firstFish = weightedFish[0].fish
  return {
    species: firstFish,
    size: Math.floor(firstFish.minSize + Math.random() * (firstFish.maxSize - firstFish.minSize))
  }
}

function getBaseWeightByRarity(rarity: string): number {
  switch (rarity) {
    case 'common': return 100
    case 'uncommon': return 40
    case 'rare': return 15
    case 'epic': return 5
    case 'legendary': return 1
    default: return 50
  }
}
