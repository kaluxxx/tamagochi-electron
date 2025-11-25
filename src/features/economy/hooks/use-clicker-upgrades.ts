import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { economyApi } from '../services/economy-api'
import type { ClickerUpgrade, ClickerGameStats, UpgradeType } from '../types'

// Configuration des upgrades (doit matcher database.ts)
export const CLICKER_UPGRADE_CONFIG = {
  multiplier: {
    baseCost: 50,
    costMultiplier: 1.5,
    baseEffect: 1,
    effectPerLevel: 0.5,
    displayName: 'Multiplicateur',
    description: 'Multiplie les pieces gagnees',
    icon: '/sprites/upgrades/multiplier.svg'
  },
  time_bonus: {
    baseCost: 30,
    costMultiplier: 1.4,
    baseEffect: 10,
    effectPerLevel: 5,
    displayName: 'Temps Bonus',
    description: '+5 secondes par niveau',
    icon: '/sprites/upgrades/time.svg'
  },
  auto_clicker: {
    baseCost: 100,
    costMultiplier: 1.8,
    baseEffect: 0,
    effectPerLevel: 1,
    displayName: 'Auto-Clicker',
    description: '+1 clic auto par seconde',
    icon: '/sprites/upgrades/auto.svg'
  }
} as const

export function calculateUpgradeCost(type: UpgradeType, currentLevel: number): number {
  const config = CLICKER_UPGRADE_CONFIG[type]
  return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel))
}

export function calculateUpgradeEffect(type: UpgradeType, level: number): number {
  const config = CLICKER_UPGRADE_CONFIG[type]
  return config.baseEffect + (config.effectPerLevel * level)
}

export function useClickerUpgrades() {
  const queryClient = useQueryClient()

  const upgradesQuery = useQuery<ClickerUpgrade[]>({
    queryKey: ['clickerUpgrades'],
    queryFn: economyApi.getClickerUpgrades,
  })

  const gameStatsQuery = useQuery<ClickerGameStats>({
    queryKey: ['clickerGameStats'],
    queryFn: economyApi.getClickerGameStats,
  })

  const purchaseMutation = useMutation({
    mutationFn: (type: UpgradeType) => economyApi.purchaseClickerUpgrade(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clickerUpgrades'] })
      queryClient.invalidateQueries({ queryKey: ['clickerGameStats'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
  })

  // Helper to get upgrade by type
  const getUpgradeByType = (type: UpgradeType): ClickerUpgrade | undefined => {
    return upgradesQuery.data?.find(u => u.type === type)
  }

  // Helper to get upgrade level by type
  const getUpgradeLevel = (type: UpgradeType): number => {
    return getUpgradeByType(type)?.level ?? 0
  }

  // Helper to get next upgrade cost
  const getNextCost = (type: UpgradeType): number => {
    const level = getUpgradeLevel(type)
    return calculateUpgradeCost(type, level)
  }

  // Helper to get current effect value
  const getCurrentEffect = (type: UpgradeType): number => {
    const level = getUpgradeLevel(type)
    return calculateUpgradeEffect(type, level)
  }

  return {
    upgrades: upgradesQuery.data ?? [],
    gameStats: gameStatsQuery.data,
    isLoading: upgradesQuery.isLoading || gameStatsQuery.isLoading,
    purchaseUpgrade: purchaseMutation.mutate,
    isPurchasing: purchaseMutation.isPending,
    purchaseError: purchaseMutation.error,
    // Helpers
    getUpgradeByType,
    getUpgradeLevel,
    getNextCost,
    getCurrentEffect,
  }
}
