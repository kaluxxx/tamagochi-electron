import type { Item } from '@/generated/prisma'
import { shopRepository, type InventoryWithItem } from '../repositories'
import { walletRepository } from '../repositories'
import { NotFoundError, InsufficientFundsError } from '../../../core/errors'

export interface PurchaseResult {
  wallet: { id: string; coins: number }
  inventory: InventoryWithItem
  item: Item
}

export class ShopController {
  private static instance: ShopController

  private constructor() {}

  static getInstance(): ShopController {
    if (!ShopController.instance) {
      ShopController.instance = new ShopController()
    }
    return ShopController.instance
  }

  async getShopItems(): Promise<Item[]> {
    return shopRepository.findAll()
  }

  async getItemById(itemId: string): Promise<Item> {
    const item = await shopRepository.findById(itemId)
    if (!item) {
      throw new NotFoundError('Item', itemId)
    }
    return item
  }

  async getItemsByType(type: string): Promise<Item[]> {
    return shopRepository.findByType(type)
  }

  async purchaseItem(itemId: string, quantity: number = 1): Promise<PurchaseResult> {
    const item = await shopRepository.findById(itemId)
    if (!item) {
      throw new NotFoundError('Item', itemId)
    }

    const totalCost = item.price * quantity
    const wallet = await walletRepository.get()

    if (wallet.coins < totalCost) {
      throw new InsufficientFundsError(totalCost, wallet.coins)
    }

    const result = await shopRepository.purchaseItemTransaction(
      wallet.id,
      itemId,
      quantity,
      totalCost
    )

    return {
      wallet: result.wallet,
      inventory: result.inventory,
      item
    }
  }
}

export const shopController = ShopController.getInstance()
