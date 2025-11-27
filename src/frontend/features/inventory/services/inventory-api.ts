import type { InventoryItem, ItemType } from '../types'

export const inventoryApi = {
  getAll: async (): Promise<InventoryItem[]> => {
    return window.api.inventory.getAll()
  },

  getByType: async (type: ItemType): Promise<InventoryItem[]> => {
    return window.api.inventory.getByType(type)
  },

  useItem: async (animalId: string, itemId: string) => {
    return window.api.items.useItem(animalId, itemId)
  }
}
