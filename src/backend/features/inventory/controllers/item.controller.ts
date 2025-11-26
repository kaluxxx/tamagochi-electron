import type { Item } from '@prisma/client'
import { itemRepository } from '../repositories'
import { NotFoundError } from '../../../core/errors'

export class ItemController {
  private static instance: ItemController

  private constructor() {}

  static getInstance(): ItemController {
    if (!ItemController.instance) {
      ItemController.instance = new ItemController()
    }
    return ItemController.instance
  }

  async getAllItems(): Promise<Item[]> {
    return itemRepository.findAll()
  }

  async getItemById(id: string): Promise<Item> {
    const item = await itemRepository.findById(id)
    if (!item) {
      throw new NotFoundError('Item', id)
    }
    return item
  }

  async getItemsByType(type: string): Promise<Item[]> {
    return itemRepository.findByType(type)
  }
}

export const itemController = ItemController.getInstance()
