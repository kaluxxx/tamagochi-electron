import { describe, it, expect } from 'vitest'
import { prismaMock } from './setup'
import { itemController, inventoryController } from '../features/inventory/controllers'
import { NotFoundError, AnimalDeadError, ValidationError, InsufficientQuantityError } from '../core/errors'

describe('ItemController', () => {
  const mockItem = {
    id: 'item-1',
    name: 'Pomme',
    type: 'food',
    price: 10,
    hungerBoost: 20,
    happinessBoost: 5,
    healthBoost: 0,
    energyBoost: 0,
    energyCost: 5,
    emoji: '🍎',
    description: 'Une pomme juteuse'
  }

  describe('getAllItems', () => {
    it('should return all items', async () => {
      prismaMock.item.findMany.mockResolvedValue([mockItem])

      const result = await itemController.getAllItems()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Pomme')
    })
  })

  describe('getItemById', () => {
    it('should return item when found', async () => {
      prismaMock.item.findUnique.mockResolvedValue(mockItem)

      const result = await itemController.getItemById('item-1')

      expect(result.name).toBe('Pomme')
    })

    it('should throw NotFoundError when item not found', async () => {
      prismaMock.item.findUnique.mockResolvedValue(null)

      await expect(itemController.getItemById('non-existent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('getItemsByType', () => {
    it('should return items by type', async () => {
      prismaMock.item.findMany.mockResolvedValue([mockItem])

      const result = await itemController.getItemsByType('food')

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('food')
    })
  })
})

describe('InventoryController', () => {
  const mockItem = {
    id: 'item-1',
    name: 'Pomme',
    type: 'food',
    price: 10,
    hungerBoost: 20,
    happinessBoost: 5,
    healthBoost: 0,
    energyBoost: 10,
    energyCost: 5,
    emoji: '🍎',
    description: 'Une pomme juteuse'
  }

  const mockInventory = {
    id: 'inv-1',
    itemId: 'item-1',
    quantity: 5,
    item: mockItem
  }

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

  describe('getInventory', () => {
    it('should return all inventory items', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([mockInventory])

      const result = await inventoryController.getInventory()

      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(5)
    })
  })

  describe('getInventoryByType', () => {
    it('should return inventory items by type', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([mockInventory])

      const result = await inventoryController.getInventoryByType('food')

      expect(result).toHaveLength(1)
    })
  })

  describe('useItem', () => {
    it('should use item and update animal stats', async () => {
      const updatedAnimal = {
        ...mockAnimal,
        hunger: 70,
        happiness: 55,
        energy: 55
      }

      prismaMock.animal.findUnique.mockResolvedValue(mockAnimal)
      prismaMock.item.findUnique.mockResolvedValue(mockItem)
      prismaMock.inventory.findUnique.mockResolvedValue(mockInventory)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.$transaction.mockResolvedValue([updatedAnimal])

      const result = await inventoryController.useItem('animal-1', 'item-1')

      expect(result.animal.hunger).toBe(70)
      expect(result.coinsEarned).toBe(1) // use_item reward
    })

    it('should throw NotFoundError when animal not found', async () => {
      prismaMock.animal.findUnique.mockResolvedValue(null)

      await expect(inventoryController.useItem('non-existent', 'item-1')).rejects.toThrow(NotFoundError)
    })

    it('should throw AnimalDeadError when animal is dead', async () => {
      const deadAnimal = { ...mockAnimal, isAlive: false }
      prismaMock.animal.findUnique.mockResolvedValue(deadAnimal)

      await expect(inventoryController.useItem('animal-1', 'item-1')).rejects.toThrow(AnimalDeadError)
    })

    it('should throw NotFoundError when item not found', async () => {
      prismaMock.animal.findUnique.mockResolvedValue(mockAnimal)
      prismaMock.item.findUnique.mockResolvedValue(null)

      await expect(inventoryController.useItem('animal-1', 'non-existent')).rejects.toThrow(NotFoundError)
    })

    it('should throw InsufficientQuantityError when item out of stock', async () => {
      const emptyInventory = { ...mockInventory, quantity: 0 }
      prismaMock.animal.findUnique.mockResolvedValue(mockAnimal)
      prismaMock.item.findUnique.mockResolvedValue(mockItem)
      prismaMock.inventory.findUnique.mockResolvedValue(emptyInventory)

      await expect(inventoryController.useItem('animal-1', 'item-1')).rejects.toThrow(InsufficientQuantityError)
    })

    it('should throw ValidationError when not enough energy', async () => {
      const tiredAnimal = { ...mockAnimal, energy: 2 }
      const costlyItem = { ...mockItem, energyCost: 10 }

      prismaMock.animal.findUnique.mockResolvedValue(tiredAnimal)
      prismaMock.item.findUnique.mockResolvedValue(costlyItem)
      prismaMock.inventory.findUnique.mockResolvedValue(mockInventory)

      await expect(inventoryController.useItem('animal-1', 'item-1')).rejects.toThrow(ValidationError)
    })
  })
})
