import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { economyApi } from '../services/economy-api'
import type { Wallet } from '../types'

export function useWallet() {
  const queryClient = useQueryClient()

  const query = useQuery<Wallet>({
    queryKey: ['wallet'],
    queryFn: economyApi.getWallet,
  })

  // Listen for wallet updates from main process
  useEffect(() => {
    const unsubscribe = window.api.onWalletUpdated((wallet: Wallet) => {
      queryClient.setQueryData(['wallet'], wallet)
    })

    return () => {
      unsubscribe()
    }
  }, [queryClient])

  return {
    wallet: query.data,
    coins: query.data?.coins ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
