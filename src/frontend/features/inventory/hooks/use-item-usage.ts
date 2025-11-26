import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../services/inventory-api'

interface UseItemParams {
  animalId: string
  itemId: string
}

export function useItemUsage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ animalId, itemId }: UseItemParams) => {
      return inventoryApi.useItem(animalId, itemId)
    },
    onSuccess: () => {
      // Invalidate inventory to refresh quantities
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      // Invalidate animal data to reflect stat changes
      queryClient.invalidateQueries({ queryKey: ['animals'] })
      // Invalidate history to show new action
      queryClient.invalidateQueries({ queryKey: ['history'] })
    }
  })
}
