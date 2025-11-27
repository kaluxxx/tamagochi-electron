import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '../services/inventory-api'
import type { ItemFilter, InventoryItem } from '../types'

export function useInventory(filter: ItemFilter = 'all') {
  return useQuery<InventoryItem[]>({
    queryKey: ['inventory', filter],
    queryFn: async () => {
      if (filter === 'all') {
        return inventoryApi.getAll()
      }
      return inventoryApi.getByType(filter)
    }
  })
}
