import type { Inventory, Item } from '@prisma/client'
import { getPrismaClient } from '../../../database/prisma'

export type InventoryWithItem = Inventory & { item: Item }

export class InventoryRepository {
  private static instance: InventoryRepository

  private constructor() {}

  static getInstance(): InventoryRepository {
    if (!InventoryRepository.instance) {
      InventoryRepository.instance = new InventoryRepository()
    }
    return InventoryRepository.instance
  }

  private get prisma() {
    return getPrismaClient()
  }

  async findAll(): Promise<InventoryWithItem[]> {
    return this.prisma.inventory.findMany({
      include: { item: true },
      orderBy: { item: { type: 'asc' } }
    })
  }

  async findByItemId(itemId: string): Promise<InventoryWithItem | null> {
    return this.prisma.inventory.findUnique({
      where: { itemId },
      include: { item: true }
    })
  }

  async findByType(type: string): Promise<InventoryWithItem[]> {
    return this.prisma.inventory.findMany({
      where: { item: { type } },
      include: { item: true }
    })
  }

  async decrementQuantity(itemId: string): Promise<Inventory> {
    return this.prisma.inventory.update({
      where: { itemId },
      data: { quantity: { decrement: 1 } }
    })
  }

  async incrementQuantity(itemId: string, amount: number): Promise<Inventory> {
    return this.prisma.inventory.upsert({
      where: { itemId },
      update: { quantity: { increment: amount } },
      create: { itemId, quantity: amount }
    })
  }
}

export const inventoryRepository = InventoryRepository.getInstance()
