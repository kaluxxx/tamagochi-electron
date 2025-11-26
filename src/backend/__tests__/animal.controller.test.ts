import { describe, it, expect } from 'vitest'
import { prismaMock } from './setup'
import { animalController } from '../features/animals/controllers'
import { NotFoundError, AnimalDeadError } from '../core/errors'

describe('AnimalController', () => {
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
    hunger: 80,
    happiness: 70,
    health: 100,
    energy: 60,
    age: 0,
    isAlive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: mockAnimalType
  }

  describe('getAllAnimals', () => {
    it('should return all animals with their types', async () => {
      prismaMock.animal.findMany.mockResolvedValue([mockAnimal])

      const result = await animalController.getAllAnimals()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Minou')
      expect(result[0].type.name).toBe('cat')
    })

    it('should return empty array when no animals', async () => {
      prismaMock.animal.findMany.mockResolvedValue([])

      const result = await animalController.getAllAnimals()

      expect(result).toHaveLength(0)
    })
  })

  describe('getAnimalById', () => {
    it('should return animal when found', async () => {
      prismaMock.animal.findUnique.mockResolvedValue(mockAnimal)

      const result = await animalController.getAnimalById('animal-1')

      expect(result.id).toBe('animal-1')
      expect(result.name).toBe('Minou')
    })

    it('should throw NotFoundError when animal not found', async () => {
      prismaMock.animal.findUnique.mockResolvedValue(null)

      await expect(animalController.getAnimalById('non-existent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('createAnimal', () => {
    it('should create a new animal', async () => {
      prismaMock.animal.create.mockResolvedValue(mockAnimal)

      const result = await animalController.createAnimal({
        name: 'Minou',
        typeId: 'type-cat'
      })

      expect(result.name).toBe('Minou')
      expect(prismaMock.animal.create).toHaveBeenCalledWith({
        data: {
          name: 'Minou',
          typeId: 'type-cat'
        },
        include: { type: true }
      })
    })
  })

  describe('tickAnimal', () => {
    it('should degrade stats based on time elapsed', async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const animalWithOldTimestamp = {
        ...mockAnimal,
        updatedAt: oneHourAgo
      }
      prismaMock.animal.findUnique.mockResolvedValue(animalWithOldTimestamp)
      prismaMock.animal.update.mockResolvedValue({
        ...animalWithOldTimestamp,
        hunger: mockAnimal.hunger - mockAnimalType.hungerDecayRate,
        happiness: mockAnimal.happiness - mockAnimalType.happinessDecayRate,
        energy: mockAnimal.energy - mockAnimalType.energyDecayRate,
        updatedAt: new Date()
      })

      const result = await animalController.tickAnimal('animal-1')

      expect(result.justDied).toBe(false)
      expect(prismaMock.animal.update).toHaveBeenCalled()
    })

    it('should kill animal when health reaches 0', async () => {
      const criticalAnimal = {
        ...mockAnimal,
        hunger: 10,
        happiness: 10,
        energy: 10,
        health: 1,
        updatedAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      }
      prismaMock.animal.findUnique.mockResolvedValue(criticalAnimal)
      prismaMock.animal.update.mockResolvedValue({
        ...criticalAnimal,
        health: 0,
        isAlive: false
      })

      const result = await animalController.tickAnimal('animal-1')

      expect(result.justDied).toBe(true)
      expect(result.animal.isAlive).toBe(false)
    })

    it('should throw NotFoundError when animal not found', async () => {
      prismaMock.animal.findUnique.mockResolvedValue(null)

      await expect(animalController.tickAnimal('non-existent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('validateAliveAnimal', () => {
    it('should return animal when alive', async () => {
      prismaMock.animal.findUnique.mockResolvedValue(mockAnimal)

      const result = await animalController.validateAliveAnimal('animal-1')

      expect(result.isAlive).toBe(true)
    })

    it('should throw NotFoundError when animal not found', async () => {
      prismaMock.animal.findUnique.mockResolvedValue(null)

      await expect(animalController.validateAliveAnimal('non-existent')).rejects.toThrow(NotFoundError)
    })

    it('should throw AnimalDeadError when animal is dead', async () => {
      const deadAnimal = { ...mockAnimal, isAlive: false }
      prismaMock.animal.findUnique.mockResolvedValue(deadAnimal)

      await expect(animalController.validateAliveAnimal('animal-1')).rejects.toThrow(AnimalDeadError)
    })
  })
})
