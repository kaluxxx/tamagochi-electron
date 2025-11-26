import type { Item, Inventory } from '@prisma/client'
import { ReadOnlyRepository } from '../../../core/base.repository'

export type InventoryWithItem = Inventory & { item: Item }

export class ShopRepository extends ReadOnlyRepository<Item> {
  private static instance: ShopRepository

  private constructor() {
    super()
  }

  static getInstance(): ShopRepository {
    if (!ShopRepository.instance) {
      ShopRepository.instance = new ShopRepository()
    }
    return ShopRepository.instance
  }

  async findAll(): Promise<Item[]> {
    return this.prisma.item.findMany({
      orderBy: [{ type: 'asc' }, { price: 'asc' }]
    })
  }

  async findById(id: string): Promise<Item | null> {
    return this.prisma.item.findUnique({
      where: { id }
    })
  }

  async findByType(type: string): Promise<Item[]> {
    return this.prisma.item.findMany({
      where: { type },
      orderBy: { price: 'asc' }
    })
  }

  async purchaseItemTransaction(
    walletId: string,
    itemId: string,
    quantity: number,
    totalCost: number
  ): Promise<{ wallet: { id: string; coins: number }; inventory: InventoryWithItem }> {
    const [updatedWallet, updatedInventory] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { coins: { decrement: totalCost } }
      }),
      this.prisma.inventory.upsert({
        where: { itemId },
        update: { quantity: { increment: quantity } },
        create: { itemId, quantity },
        include: { item: true }
      })
    ])

    return { wallet: updatedWallet, inventory: updatedInventory }
  }
}

export const shopRepository = ShopRepository.getInstance()
