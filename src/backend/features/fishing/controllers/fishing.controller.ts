import type { FishSpecies, FishingRod, FishingBait, FishingLocation, FishingUpgrade, FishingProgress } from '@prisma/client'
import {
  fishSpeciesRepository,
  fishCatchRepository,
  fishingRodRepository,
  fishingBaitRepository,
  fishingLocationRepository,
  fishingUpgradeRepository,
  fishingProgressRepository,
  type SpeciesStats,
  type FishingUpgradeType,
  FISHING_UPGRADE_CONFIG,
  calculateFishingUpgradeCost,
  calculateFishingUpgradeEffect,
  FISHING_XP_CONFIG,
  calculateLevel
} from '../repositories'
import { walletRepository } from '../../economy/repositories'
import {
  NotFoundError,
  InsufficientFundsError,
  AlreadyOwnedError,
  AlreadyUnlockedError,
  ValidationError
} from '../../../core/errors'

export interface FishingStats {
  luckBonus: number
  reflexBonus: number
  valueBonus: number
  baitEfficiencyBonus: number
}

export interface CatchFishResult {
  catch: { id: string; speciesId: string; size: number; coinsEarned: number }
  wallet: { id: string; coins: number }
  progress: FishingProgress
  species: FishSpecies
  coinsEarned: number
  xpEarned: number
  isFirstCatch: boolean
}

export interface SelectedFish {
  species: FishSpecies
  size: number
}

export interface UpgradeWithDetails {
  type: string
  level: number
  displayName: string
  description: string
  currentEffect: number
  nextEffect: number
  effectPerLevel: number
  cost: number
}

export class FishingController {
  private static instance: FishingController

  private constructor() {}

  static getInstance(): FishingController {
    if (!FishingController.instance) {
      FishingController.instance = new FishingController()
    }
    return FishingController.instance
  }

  // ============== Species ==============

  async getAllSpecies(): Promise<FishSpecies[]> {
    return fishSpeciesRepository.findAll()
  }

  async getSpeciesById(id: string): Promise<FishSpecies> {
    const species = await fishSpeciesRepository.findById(id)
    if (!species) {
      throw new NotFoundError('FishSpecies', id)
    }
    return species
  }

  // ============== Catalog ==============

  async getCaughtFish(): Promise<SpeciesStats[]> {
    return fishCatchRepository.getCaughtSpeciesStats()
  }

  async getCaughtSpeciesIds(): Promise<string[]> {
    return fishCatchRepository.getCaughtSpeciesIds()
  }

  // ============== Game Actions ==============

  async selectRandomFish(locationId: string, baitId?: string): Promise<SelectedFish> {
    const location = await fishingLocationRepository.findById(locationId)
    if (!location) {
      throw new NotFoundError('FishingLocation', locationId)
    }

    const availableFishIds = JSON.parse(location.availableFish) as string[]
    const availableFish = await fishSpeciesRepository.findByIds(availableFishIds)

    if (availableFish.length === 0) {
      throw new ValidationError('No fish available in this location')
    }

    let bait: FishingBait | null = null
    if (baitId) {
      bait = await fishingBaitRepository.findById(baitId)
    }

    const stats = await this.getStats()

    const weightedFish: { fish: FishSpecies; weight: number }[] = []

    for (const fish of availableFish) {
      let weight = this.getBaseWeightByRarity(fish.rarity)

      if (['rare', 'epic', 'legendary'].includes(fish.rarity)) {
        weight *= (1 + stats.luckBonus / 100)
      }

      if (bait) {
        const baitPrefs = JSON.parse(fish.baitPreference) as string[]
        if (baitPrefs.includes(bait.name)) {
          weight *= 2
        }

        if (bait.targetRarity) {
          const targetRarities = JSON.parse(bait.targetRarity) as string[]
          if (targetRarities.includes(fish.rarity)) {
            weight *= 1.5
          }
        }
      }

      weightedFish.push({ fish, weight })
    }

    const totalWeight = weightedFish.reduce((sum, wf) => sum + wf.weight, 0)
    let random = Math.random() * totalWeight

    for (const wf of weightedFish) {
      random -= wf.weight
      if (random <= 0) {
        const size = Math.floor(
          wf.fish.minSize + Math.random() * (wf.fish.maxSize - wf.fish.minSize)
        )
        return { species: wf.fish, size }
      }
    }

    const firstFish = weightedFish[0].fish
    return {
      species: firstFish,
      size: Math.floor(firstFish.minSize + Math.random() * (firstFish.maxSize - firstFish.minSize))
    }
  }

  private getBaseWeightByRarity(rarity: string): number {
    switch (rarity) {
      case 'common': return 100
      case 'uncommon': return 40
      case 'rare': return 15
      case 'epic': return 5
      case 'legendary': return 1
      default: return 50
    }
  }

  async catchFish(
    speciesId: string,
    size: number,
    locationId: string,
    rodId: string,
    baitId?: string
  ): Promise<CatchFishResult> {
    const species = await fishSpeciesRepository.findById(speciesId)
    if (!species) {
      throw new NotFoundError('FishSpecies', speciesId)
    }

    const isFirstCatch = !(await fishCatchRepository.hasBeenCaught(speciesId))

    const stats = await this.getStats()
    const valueMultiplier = 1 + (stats.valueBonus / 100)

    let baseCoins = species.baseValue
    const sizeRatio = size / species.maxSize
    const sizeBonus = Math.floor(baseCoins * sizeRatio * 0.5)
    baseCoins += sizeBonus
    baseCoins = Math.floor(baseCoins * valueMultiplier)

    if (isFirstCatch) {
      baseCoins *= 3
    }

    const rarityXp = FISHING_XP_CONFIG[species.rarity as keyof typeof FISHING_XP_CONFIG] || 10
    let xpEarned = rarityXp
    if (isFirstCatch) {
      xpEarned *= FISHING_XP_CONFIG.firstCatchMultiplier
    }

    const progress = await fishingProgressRepository.get()

    const fishCatch = await fishCatchRepository.create({
      speciesId,
      size,
      coinsEarned: baseCoins,
      isFirstCatch,
      locationId,
      rodId,
      baitId: baitId || null
    })

    const updatedWallet = await walletRepository.addCoins(baseCoins)

    await fishingProgressRepository.update({
      experienceIncrement: xpEarned,
      totalFishCaughtIncrement: 1,
      currentStreakIncrement: 1,
      ...(size > (progress.largestFishSize || 0) ? {
        largestFishId: speciesId,
        largestFishSize: size
      } : {})
    })

    if (baitId) {
      await fishingBaitRepository.consumeOne(baitId)
    }

    const updatedProgress = await fishingProgressRepository.get()
    const newLevel = calculateLevel(updatedProgress.experience)
    if (newLevel > updatedProgress.level) {
      await fishingProgressRepository.update({ level: newLevel })
    }

    if (updatedProgress.currentStreak > updatedProgress.bestStreak) {
      await fishingProgressRepository.update({ bestStreak: updatedProgress.currentStreak })
    }

    return {
      catch: fishCatch,
      wallet: updatedWallet,
      progress: await fishingProgressRepository.get(),
      species,
      coinsEarned: baseCoins,
      xpEarned,
      isFirstCatch
    }
  }

  async failCatch(): Promise<{ progress: FishingProgress }> {
    await fishingProgressRepository.resetStreak()
    return { progress: await fishingProgressRepository.get() }
  }

  // ============== Rods ==============

  async getRods(): Promise<FishingRod[]> {
    return fishingRodRepository.findAll()
  }

  async getEquippedRod(): Promise<FishingRod | null> {
    return fishingRodRepository.findEquipped()
  }

  async purchaseRod(rodId: string): Promise<{ wallet: { id: string; coins: number }; rod: FishingRod }> {
    const rod = await fishingRodRepository.findById(rodId)
    if (!rod) {
      throw new NotFoundError('FishingRod', rodId)
    }
    if (rod.isOwned) {
      throw new AlreadyOwnedError('Rod')
    }

    const wallet = await walletRepository.get()
    if (wallet.coins < rod.price) {
      throw new InsufficientFundsError(rod.price, wallet.coins)
    }

    return fishingRodRepository.purchaseTransaction(rodId, wallet.id, rod.price)
  }

  async equipRod(rodId: string): Promise<FishingRod> {
    const rod = await fishingRodRepository.findById(rodId)
    if (!rod) {
      throw new NotFoundError('FishingRod', rodId)
    }
    if (!rod.isOwned) {
      throw new ValidationError('Rod not owned')
    }

    return fishingRodRepository.equip(rodId)
  }

  // ============== Baits ==============

  async getBaits(): Promise<FishingBait[]> {
    return fishingBaitRepository.findAll()
  }

  async purchaseBait(
    baitId: string,
    quantity: number
  ): Promise<{ wallet: { id: string; coins: number }; bait: FishingBait; cost: number }> {
    const bait = await fishingBaitRepository.findById(baitId)
    if (!bait) {
      throw new NotFoundError('FishingBait', baitId)
    }

    const totalCost = bait.price * quantity
    const wallet = await walletRepository.get()
    if (wallet.coins < totalCost) {
      throw new InsufficientFundsError(totalCost, wallet.coins)
    }

    const result = await fishingBaitRepository.purchaseTransaction(baitId, quantity, wallet.id, totalCost)
    return { ...result, cost: totalCost }
  }

  // ============== Locations ==============

  async getLocations(): Promise<FishingLocation[]> {
    return fishingLocationRepository.findAll()
  }

  async unlockLocation(locationId: string): Promise<{ wallet: { id: string; coins: number }; location: FishingLocation }> {
    const location = await fishingLocationRepository.findById(locationId)
    if (!location) {
      throw new NotFoundError('FishingLocation', locationId)
    }
    if (location.isUnlocked) {
      throw new AlreadyUnlockedError('Location')
    }

    const wallet = await walletRepository.get()
    if (wallet.coins < location.unlockCost) {
      throw new InsufficientFundsError(location.unlockCost, wallet.coins)
    }

    return fishingLocationRepository.unlockTransaction(locationId, wallet.id, location.unlockCost)
  }

  // ============== Upgrades ==============

  async getUpgrades(): Promise<FishingUpgrade[]> {
    return fishingUpgradeRepository.findAll()
  }

  async purchaseUpgrade(type: FishingUpgradeType): Promise<{ wallet: { id: string; coins: number }; upgrade: FishingUpgrade; cost: number }> {
    const upgrade = await fishingUpgradeRepository.findByType(type)
    const cost = calculateFishingUpgradeCost(type, upgrade.level)
    const wallet = await walletRepository.get()

    if (wallet.coins < cost) {
      throw new InsufficientFundsError(cost, wallet.coins)
    }

    const result = await fishingUpgradeRepository.purchaseTransaction(type, cost, wallet.id)
    return { ...result, cost }
  }

  async getStats(): Promise<FishingStats> {
    const upgrades = await fishingUpgradeRepository.findAll()

    const getLevel = (upgradeType: FishingUpgradeType) =>
      upgrades.find(u => u.type === upgradeType)?.level || 0

    return {
      luckBonus: calculateFishingUpgradeEffect('luck', getLevel('luck')),
      reflexBonus: calculateFishingUpgradeEffect('reflexes', getLevel('reflexes')),
      valueBonus: calculateFishingUpgradeEffect('value', getLevel('value')),
      baitEfficiencyBonus: calculateFishingUpgradeEffect('bait_efficiency', getLevel('bait_efficiency'))
    }
  }

  async getUpgradesWithDetails(): Promise<UpgradeWithDetails[]> {
    const upgrades = await fishingUpgradeRepository.findAll()
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
        cost
      }
    })
  }

  // ============== Progress ==============

  async getProgress(): Promise<FishingProgress> {
    return fishingProgressRepository.get()
  }
}

export const fishingController = FishingController.getInstance()

// Re-export types
export { type FishingUpgradeType }
