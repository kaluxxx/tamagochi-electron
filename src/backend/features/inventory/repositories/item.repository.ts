import type { Item } from '@/generated/prisma'
import { ReadOnlyRepository } from '../../../core/base.repository'

export class ItemRepository extends ReadOnlyRepository<Item> {
  private static instance: ItemRepository

  private constructor() {
    super()
  }

  static getInstance(): ItemRepository {
    if (!ItemRepository.instance) {
      ItemRepository.instance = new ItemRepository()
    }
    return ItemRepository.instance
  }

  async findAll(): Promise<Item[]> {
    return this.prisma.item.findMany()
  }

  async findById(id: string): Promise<Item | null> {
    return this.prisma.item.findUnique({
      where: { id }
    })
  }

  async findByType(type: string): Promise<Item[]> {
    return this.prisma.item.findMany({
      where: { type }
    })
  }
}

export const itemRepository = ItemRepository.getInstance()
