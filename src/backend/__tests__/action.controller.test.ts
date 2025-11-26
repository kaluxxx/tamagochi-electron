import { describe, it, expect } from 'vitest'
import { prismaMock } from './setup'
import { actionController } from '../features/animals/controllers'
import { NotFoundError, AnimalDeadError, ValidationError } from '../core/errors'

describe('ActionController', () => {
  const mockAnimalType = {
    id: 'type-cat',
    name: 'cat',
    displayName: 'Chat',
    hungerDecayRate: 2.5,
    happinessDecayRate: 2,
    energyDecayRate: 1.5,
    healthDecayRate: 3,
    emoji: '🐱'
  }

  const mockAnimal = {
    id: 'animal-1',
    name: 'Minou',
    typeId: 'type-cat',
    hunger: 50,
    happiness: 50,
    health: 100,
    energy: 50,
    age: 0,
    isAlive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: mockAnimalType
  }

  const mockWallet = {
    id: 'wallet-1',
    coins: 100,
    lastPassiveGain: new Date(),
    createdAt: new Date()
  }

  describe('feedAnimal', () => {
    it('should feed animal and increase hunger', async () => {
      const updatedAnimal = { ...mockAnimal, hunger: 70, happiness: 55, energy: 45 }

      prismaMock.animal.findUnique.mockResolvedValue(mockAnimal)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.$transaction.mockResolvedValue([updatedAnimal])

      const result = await actionController.feedAnimal('animal-1')

      expect(result.animal.hunger).toBe(70)
      expect(result.coinsEarned).toBe(2) // ECONOMY_CONFIG.actionRewards.feed
    })

    it('should throw NotFoundError when animal not found', async () => {
      prismaMock.animal.findUnique.mockResolvedValue(null)

      await expect(actionController.feedAnimal('non-existent')).rejects.toThrow(NotFoundError)
    })

    it('should throw AnimalDeadError when animal is dead', async () => {
      const deadAnimal = { ...mockAnimal, isAlive: false }
      prismaMock.animal.findUnique.mockResolvedValue(deadAnimal)

      await expect(actionController.feedAnimal('animal-1')).rejects.toThrow(AnimalDeadError)
    })
  })

  describe('playWithAnimal', () => {
    it('should play with animal and increase happiness', async () => {
      const updatedAnimal = { ...mockAnimal, happiness: 65, energy: 40, hunger: 45 }

      prismaMock.animal.findUnique.mockResolvedValue(mockAnimal)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.$transaction.mockResolvedValue([updatedAnimal])

      const result = await actionController.playWithAnimal('animal-1')

      expect(result.animal.happiness).toBe(65)
      expect(result.coinsEarned).toBe(5) // ECONOMY_CONFIG.actionRewards.play
    })

    it('should throw ValidationError when not enough energy', async () => {
      const tiredAnimal = { ...mockAnimal, energy: 10 }
      prismaMock.animal.findUnique.mockResolvedValue(tiredAnimal)

      await expect(actionController.playWithAnimal('animal-1')).rejects.toThrow(ValidationError)
    })

    it('should throw AnimalDeadError when animal is dead', async () => {
      const deadAnimal = { ...mockAnimal, isAlive: false }
      prismaMock.animal.findUnique.mockResolvedValue(deadAnimal)

      await expect(actionController.playWithAnimal('animal-1')).rejects.toThrow(AnimalDeadError)
    })
  })

  describe('healAnimal', () => {
    it('should heal animal and increase health', async () => {
      const sickAnimal = { ...mockAnimal, health: 50 }
      const healedAnimal = { ...sickAnimal, health: 70 }

      prismaMock.animal.findUnique.mockResolvedValue(sickAnimal)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.$transaction.mockResolvedValue([healedAnimal])

      const result = await actionController.healAnimal('animal-1')

      expect(result.animal.health).toBe(70)
      expect(result.coinsEarned).toBe(3) // ECONOMY_CONFIG.actionRewards.heal
    })

    it('should throw NotFoundError when animal not found', async () => {
      prismaMock.animal.findUnique.mockResolvedValue(null)

      await expect(actionController.healAnimal('non-existent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('sleepAnimal', () => {
    it('should put animal to sleep and increase energy', async () => {
      const tiredAnimal = { ...mockAnimal, energy: 30 }
      const restedAnimal = { ...tiredAnimal, energy: 60, happiness: 55 }

      prismaMock.animal.findUnique.mockResolvedValue(tiredAnimal)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.$transaction.mockResolvedValue([restedAnimal])

      const result = await actionController.sleepAnimal('animal-1')

      expect(result.animal.energy).toBe(60)
      expect(result.coinsEarned).toBe(8) // ECONOMY_CONFIG.actionRewards.sleep
    })

    it('should throw ValidationError when not tired enough', async () => {
      const energeticAnimal = { ...mockAnimal, energy: 90 }
      prismaMock.animal.findUnique.mockResolvedValue(energeticAnimal)

      await expect(actionController.sleepAnimal('animal-1')).rejects.toThrow(ValidationError)
    })
  })

  describe('getActionsByAnimalId', () => {
    it('should return actions for animal', async () => {
      const mockActions = [
        {
          id: 'action-1',
          animalId: 'animal-1',
          actionType: 'feed',
          itemId: null,
          timestamp: new Date(),
          hungerBefore: 50,
          happinessBefore: 50,
          healthBefore: 100,
          energyBefore: 50,
          hungerAfter: 70,
          happinessAfter: 55,
          healthAfter: 100,
          energyAfter: 45,
          coinsEarned: 2
        }
      ]
      prismaMock.action.findMany.mockResolvedValue(mockActions)

      const result = await actionController.getActionsByAnimalId('animal-1')

      expect(result).toHaveLength(1)
      expect(result[0].actionType).toBe('feed')
    })
  })

  describe('getActionHistory', () => {
    it('should return action history with limit', async () => {
      const mockActions = [
        {
          id: 'action-1',
          animalId: 'animal-1',
          actionType: 'feed',
          itemId: null,
          timestamp: new Date(),
          hungerBefore: 50,
          happinessBefore: 50,
          healthBefore: 100,
          energyBefore: 50,
          hungerAfter: 70,
          happinessAfter: 55,
          healthAfter: 100,
          energyAfter: 45,
          coinsEarned: 2
        },
        {
          id: 'action-2',
          animalId: 'animal-1',
          actionType: 'play',
          itemId: null,
          timestamp: new Date(),
          hungerBefore: 70,
          happinessBefore: 55,
          healthBefore: 100,
          energyBefore: 45,
          hungerAfter: 65,
          happinessAfter: 70,
          healthAfter: 100,
          energyAfter: 35,
          coinsEarned: 5
        }
      ]
      prismaMock.action.findMany.mockResolvedValue(mockActions)

      const result = await actionController.getActionHistory('animal-1', 10)

      expect(result).toHaveLength(2)
    })
  })
})
