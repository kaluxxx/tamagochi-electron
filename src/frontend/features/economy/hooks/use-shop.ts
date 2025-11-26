import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { economyApi } from '../services/economy-api'
import type { ShopItem, PurchaseResult } from '../types'

export function useShop() {
  const queryClient = useQueryClient()

  const query = useQuery<ShopItem[]>({
    queryKey: ['shop-items'],
    queryFn: economyApi.getShopItems,
  })

  const purchaseMutation = useMutation<PurchaseResult, Error, { itemId: string; quantity?: number }>({
    mutationFn: ({ itemId, quantity = 1 }) => economyApi.purchaseItem(itemId, quantity),
    onSuccess: (result) => {
      // Update wallet after purchase
      queryClient.setQueryData(['wallet'], result.wallet)
      // Invalidate shop items to refresh stock
      queryClient.invalidateQueries({ queryKey: ['shop-items'] })
      // Invalidate inventory
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })

  // Group items by type
  const foodItems = query.data?.filter((item) => item.type === 'food') ?? []
  const toyItems = query.data?.filter((item) => item.type === 'toy') ?? []
  const medicineItems = query.data?.filter((item) => item.type === 'medicine') ?? []

  return {
    items: query.data ?? [],
    foodItems,
    toyItems,
    medicineItems,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    purchase: purchaseMutation.mutate,
    isPurchasing: purchaseMutation.isPending,
    purchaseError: purchaseMutation.error,
  }
}
