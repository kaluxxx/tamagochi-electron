import { describe, it, expect } from 'vitest'
import { prismaMock } from './setup'
import { fishingController } from '../features/fishing/controllers'
import { NotFoundError, InsufficientFundsError, AlreadyOwnedError, AlreadyUnlockedError, ValidationError } from '../core/errors'

describe('FishingController', () => {
  const now = new Date()

  const mockSpecies = {
    id: 'species-1',
    name: 'Carpe',
    displayName: 'Carpe',
    rarity: 'common',
    minSize: 10,
    maxSize: 50,
    baseValue: 5,
    difficulty: 1,
    locations: '["location-1"]',
    baitPreference: '["vers"]',
    description: 'Un poisson commun',
    emoji: '🐟'
  }

  const mockRod = {
    id: 'rod-1',
    name: 'basic',
    displayName: 'Canne Basique',
    description: 'Une canne de débutant',
    tier: 1,
    price: 0,
    reelZoneBonus: 0,
    catchRateBonus: 0,
    rarityBonus: 0,
    isOwned: true,
    isEquipped: true
  }

  const mockBait = {
    id: 'bait-1',
    name: 'vers',
    displayName: 'Vers',
    description: 'Appât basique',
    price: 5,
    quantity: 10,
    catchRateBonus: 0,
    maxUses: 1,
    targetRarity: null,
    targetSpecies: null,
    emoji: '🪱'
  }

  const mockLocation = {
    id: 'location-1',
    name: 'pond',
    displayName: 'Étang',
    description: 'Un petit étang paisible',
    unlockCost: 0,
    difficulty: 1.0,
    isUnlocked: true,
    availableFish: '["species-1"]',
    unlockOrder: 0,
    emoji: '🏞️'
  }

  const mockUpgrade = {
    id: 'upgrade-1',
    type: 'luck',
    level: 0,
    createdAt: now,
    updatedAt: now
  }

  const mockProgress = {
    id: 'progress-1',
    level: 1,
    experience: 0,
    totalFishCaught: 0,
    currentStreak: 0,
    bestStreak: 0,
    largestFishId: null,
    largestFishSize: null,
    createdAt: now,
    updatedAt: now
  }

  const mockWallet = {
    id: 'wallet-1',
    coins: 100,
    lastPassiveGain: now,
    createdAt: now
  }

  describe('getAllSpecies', () => {
    it('should return all fish species', async () => {
      prismaMock.fishSpecies.findMany.mockResolvedValue([mockSpecies])

      const result = await fishingController.getAllSpecies()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Carpe')
    })
  })

  describe('getSpeciesById', () => {
    it('should return species when found', async () => {
      prismaMock.fishSpecies.findUnique.mockResolvedValue(mockSpecies)

      const result = await fishingController.getSpeciesById('species-1')

      expect(result.name).toBe('Carpe')
    })

    it('should throw NotFoundError when species not found', async () => {
      prismaMock.fishSpecies.findUnique.mockResolvedValue(null)

      await expect(fishingController.getSpeciesById('non-existent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('getRods', () => {
    it('should return all rods', async () => {
      prismaMock.fishingRod.findMany.mockResolvedValue([mockRod])

      const result = await fishingController.getRods()

      expect(result).toHaveLength(1)
      expect(result[0].displayName).toBe('Canne Basique')
    })
  })

  describe('purchaseRod', () => {
    it('should purchase rod successfully', async () => {
      const unownedRod = { ...mockRod, isOwned: false, price: 50 }
      prismaMock.fishingRod.findUnique.mockResolvedValue(unownedRod)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.$transaction.mockResolvedValue([
        { ...mockWallet, coins: 50 },
        { ...unownedRod, isOwned: true }
      ])

      const result = await fishingController.purchaseRod('rod-1')

      expect(result.rod.isOwned).toBe(true)
      expect(result.wallet.coins).toBe(50)
    })

    it('should throw NotFoundError when rod not found', async () => {
      prismaMock.fishingRod.findUnique.mockResolvedValue(null)

      await expect(fishingController.purchaseRod('non-existent')).rejects.toThrow(NotFoundError)
    })

    it('should throw AlreadyOwnedError when rod already owned', async () => {
      prismaMock.fishingRod.findUnique.mockResolvedValue(mockRod)

      await expect(fishingController.purchaseRod('rod-1')).rejects.toThrow(AlreadyOwnedError)
    })

    it('should throw InsufficientFundsError when not enough coins', async () => {
      const expensiveRod = { ...mockRod, isOwned: false, price: 500 }
      prismaMock.fishingRod.findUnique.mockResolvedValue(expensiveRod)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)

      await expect(fishingController.purchaseRod('rod-1')).rejects.toThrow(InsufficientFundsError)
    })
  })

  describe('equipRod', () => {
    it('should equip owned rod', async () => {
      const equippedRod = { ...mockRod, isEquipped: true }
      prismaMock.fishingRod.findUnique.mockResolvedValue(mockRod)
      prismaMock.fishingRod.updateMany.mockResolvedValue({ count: 1 })
      prismaMock.fishingRod.update.mockResolvedValue(equippedRod)

      const result = await fishingController.equipRod('rod-1')

      expect(result.isEquipped).toBe(true)
    })

    it('should throw NotFoundError when rod not found', async () => {
      prismaMock.fishingRod.findUnique.mockResolvedValue(null)

      await expect(fishingController.equipRod('non-existent')).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError when rod not owned', async () => {
      const unownedRod = { ...mockRod, isOwned: false }
      prismaMock.fishingRod.findUnique.mockResolvedValue(unownedRod)

      await expect(fishingController.equipRod('rod-1')).rejects.toThrow(ValidationError)
    })
  })

  describe('getBaits', () => {
    it('should return all baits', async () => {
      prismaMock.fishingBait.findMany.mockResolvedValue([mockBait])

      const result = await fishingController.getBaits()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('vers')
    })
  })

  describe('purchaseBait', () => {
    it('should purchase bait successfully', async () => {
      prismaMock.fishingBait.findUnique.mockResolvedValue(mockBait)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.$transaction.mockResolvedValue([
        { ...mockWallet, coins: 75 },
        { ...mockBait, quantity: 15 }
      ])

      const result = await fishingController.purchaseBait('bait-1', 5)

      expect(result.bait.quantity).toBe(15)
      expect(result.cost).toBe(25)
    })

    it('should throw NotFoundError when bait not found', async () => {
      prismaMock.fishingBait.findUnique.mockResolvedValue(null)

      await expect(fishingController.purchaseBait('non-existent', 1)).rejects.toThrow(NotFoundError)
    })

    it('should throw InsufficientFundsError when not enough coins', async () => {
      const expensiveBait = { ...mockBait, price: 50 }
      prismaMock.fishingBait.findUnique.mockResolvedValue(expensiveBait)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)

      await expect(fishingController.purchaseBait('bait-1', 10)).rejects.toThrow(InsufficientFundsError)
    })
  })

  describe('getLocations', () => {
    it('should return all locations', async () => {
      prismaMock.fishingLocation.findMany.mockResolvedValue([mockLocation])

      const result = await fishingController.getLocations()

      expect(result).toHaveLength(1)
      expect(result[0].displayName).toBe('Étang')
    })
  })

  describe('unlockLocation', () => {
    it('should unlock location successfully', async () => {
      const lockedLocation = { ...mockLocation, isUnlocked: false, unlockCost: 50 }
      prismaMock.fishingLocation.findUnique.mockResolvedValue(lockedLocation)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.$transaction.mockResolvedValue([
        { ...mockWallet, coins: 50 },
        { ...lockedLocation, isUnlocked: true }
      ])

      const result = await fishingController.unlockLocation('location-1')

      expect(result.location.isUnlocked).toBe(true)
      expect(result.wallet.coins).toBe(50)
    })

    it('should throw NotFoundError when location not found', async () => {
      prismaMock.fishingLocation.findUnique.mockResolvedValue(null)

      await expect(fishingController.unlockLocation('non-existent')).rejects.toThrow(NotFoundError)
    })

    it('should throw AlreadyUnlockedError when location already unlocked', async () => {
      prismaMock.fishingLocation.findUnique.mockResolvedValue(mockLocation)

      await expect(fishingController.unlockLocation('location-1')).rejects.toThrow(AlreadyUnlockedError)
    })

    it('should throw InsufficientFundsError when not enough coins', async () => {
      const expensiveLocation = { ...mockLocation, isUnlocked: false, unlockCost: 500 }
      prismaMock.fishingLocation.findUnique.mockResolvedValue(expensiveLocation)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)

      await expect(fishingController.unlockLocation('location-1')).rejects.toThrow(InsufficientFundsError)
    })
  })

  describe('getUpgrades', () => {
    it('should return all upgrades', async () => {
      // findAll calls findUnique for each upgrade type
      prismaMock.fishingUpgrade.findUnique.mockResolvedValueOnce({ id: '1', type: 'luck', level: 0, createdAt: now, updatedAt: now })
      prismaMock.fishingUpgrade.findUnique.mockResolvedValueOnce({ id: '2', type: 'reflexes', level: 0, createdAt: now, updatedAt: now })
      prismaMock.fishingUpgrade.findUnique.mockResolvedValueOnce({ id: '3', type: 'value', level: 0, createdAt: now, updatedAt: now })
      prismaMock.fishingUpgrade.findUnique.mockResolvedValueOnce({ id: '4', type: 'bait_efficiency', level: 0, createdAt: now, updatedAt: now })

      const result = await fishingController.getUpgrades()

      expect(result).toHaveLength(4)
      expect(result[0].type).toBe('luck')
    })
  })

  describe('purchaseUpgrade', () => {
    it('should purchase upgrade successfully', async () => {
      const richWallet = { ...mockWallet, coins: 500 }
      prismaMock.fishingUpgrade.findUnique.mockResolvedValue(mockUpgrade)
      prismaMock.wallet.findFirst.mockResolvedValue(richWallet)
      prismaMock.$transaction.mockResolvedValue([
        { ...richWallet, coins: 450 },
        { ...mockUpgrade, level: 1 }
      ])

      const result = await fishingController.purchaseUpgrade('luck')

      expect(result.upgrade.level).toBe(1)
      expect(result.cost).toBeGreaterThan(0)
    })

    it('should throw InsufficientFundsError when not enough coins', async () => {
      const poorWallet = { ...mockWallet, coins: 10 }
      prismaMock.fishingUpgrade.findUnique.mockResolvedValue({ ...mockUpgrade, level: 10 })
      prismaMock.wallet.findFirst.mockResolvedValue(poorWallet)

      await expect(fishingController.purchaseUpgrade('luck')).rejects.toThrow(InsufficientFundsError)
    })
  })

  describe('getProgress', () => {
    it('should return fishing progress', async () => {
      prismaMock.fishingProgress.findFirst.mockResolvedValue(mockProgress)

      const result = await fishingController.getProgress()

      expect(result.level).toBe(1)
      expect(result.totalFishCaught).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return calculated fishing stats', async () => {
      // getStats calls findAll which calls findUnique for each type
      prismaMock.fishingUpgrade.findUnique.mockResolvedValueOnce({ id: '1', type: 'luck', level: 2, createdAt: now, updatedAt: now })
      prismaMock.fishingUpgrade.findUnique.mockResolvedValueOnce({ id: '2', type: 'reflexes', level: 1, createdAt: now, updatedAt: now })
      prismaMock.fishingUpgrade.findUnique.mockResolvedValueOnce({ id: '3', type: 'value', level: 3, createdAt: now, updatedAt: now })
      prismaMock.fishingUpgrade.findUnique.mockResolvedValueOnce({ id: '4', type: 'bait_efficiency', level: 0, createdAt: now, updatedAt: now })

      const result = await fishingController.getStats()

      expect(result.luckBonus).toBeGreaterThanOrEqual(0)
      expect(result.reflexBonus).toBeGreaterThanOrEqual(0)
      expect(result.valueBonus).toBeGreaterThanOrEqual(0)
      expect(result.baitEfficiencyBonus).toBeGreaterThanOrEqual(0)
    })
  })

  describe('failCatch', () => {
    it('should reset streak on failed catch', async () => {
      prismaMock.fishingProgress.findFirst.mockResolvedValue(mockProgress)
      prismaMock.fishingProgress.update.mockResolvedValue({ ...mockProgress, currentStreak: 0 })

      const result = await fishingController.failCatch()

      expect(result.progress.currentStreak).toBe(0)
    })
  })
})
