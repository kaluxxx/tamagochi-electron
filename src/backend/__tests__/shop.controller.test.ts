import { describe, it, expect } from 'vitest'
import { prismaMock } from './setup'
import { shopController } from '../features/economy/controllers'
import { NotFoundError, InsufficientFundsError } from '../core/errors'

describe('ShopController', () => {
  const mockItem = {
    id: 'item-1',
    name: 'Pomme',
    type: 'food',
    price: 10,
    hungerBoost: 20,
    happinessBoost: 5,
    healthBoost: 0,
    energyBoost: 0,
    energyCost: 0,
    emoji: '🍎',
    description: 'Une pomme juteuse'
  }

  const mockWallet = {
    id: 'wallet-1',
    coins: 100,
    lastPassiveGain: new Date(),
    createdAt: new Date()
  }

  describe('getShopItems', () => {
    it('should return all shop items', async () => {
      prismaMock.item.findMany.mockResolvedValue([mockItem])

      const result = await shopController.getShopItems()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Pomme')
    })

    it('should return empty array when no items', async () => {
      prismaMock.item.findMany.mockResolvedValue([])

      const result = await shopController.getShopItems()

      expect(result).toHaveLength(0)
    })
  })

  describe('getItemById', () => {
    it('should return item when found', async () => {
      prismaMock.item.findUnique.mockResolvedValue(mockItem)

      const result = await shopController.getItemById('item-1')

      expect(result.id).toBe('item-1')
      expect(result.name).toBe('Pomme')
    })

    it('should throw NotFoundError when item not found', async () => {
      prismaMock.item.findUnique.mockResolvedValue(null)

      await expect(shopController.getItemById('non-existent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('getItemsByType', () => {
    it('should return items of specified type', async () => {
      prismaMock.item.findMany.mockResolvedValue([mockItem])

      const result = await shopController.getItemsByType('food')

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('food')
    })
  })

  describe('purchaseItem', () => {
    it('should purchase item successfully', async () => {
      const mockInventory = {
        id: 'inv-1',
        itemId: 'item-1',
        quantity: 1,
        item: mockItem
      }

      prismaMock.item.findUnique.mockResolvedValue(mockItem)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.$transaction.mockResolvedValue([
        { ...mockWallet, coins: 90 },
        mockInventory
      ])

      const result = await shopController.purchaseItem('item-1', 1)

      expect(result.wallet.coins).toBe(90)
      expect(result.inventory.quantity).toBe(1)
      expect(result.item.name).toBe('Pomme')
    })

    it('should throw NotFoundError when item not found', async () => {
      prismaMock.item.findUnique.mockResolvedValue(null)

      await expect(shopController.purchaseItem('non-existent', 1)).rejects.toThrow(NotFoundError)
    })

    it('should throw InsufficientFundsError when not enough coins', async () => {
      const expensiveItem = { ...mockItem, price: 200 }
      prismaMock.item.findUnique.mockResolvedValue(expensiveItem)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)

      await expect(shopController.purchaseItem('item-1', 1)).rejects.toThrow(InsufficientFundsError)
    })

    it('should calculate total cost for multiple items', async () => {
      const mockInventory = {
        id: 'inv-1',
        itemId: 'item-1',
        quantity: 5,
        item: mockItem
      }

      prismaMock.item.findUnique.mockResolvedValue(mockItem)
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.$transaction.mockResolvedValue([
        { ...mockWallet, coins: 50 }, // 100 - (10 * 5)
        mockInventory
      ])

      const result = await shopController.purchaseItem('item-1', 5)

      expect(result.wallet.coins).toBe(50)
    })
  })
})
