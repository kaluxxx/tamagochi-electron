import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fishingApi } from '../services/fishing-api'
import { useFishingStore } from '../stores/fishing.store'
import { audioManager } from '@frontend/features/audio/services/audio-manager'
import type { FishingUpgradeType } from '../types'

// ============== SPECIES & CATALOG ==============

export function useFishSpecies() {
  return useQuery({
    queryKey: ['fishing', 'species'],
    queryFn: fishingApi.getAllSpecies,
  })
}

export function useCaughtFish() {
  return useQuery({
    queryKey: ['fishing', 'caughtFish'],
    queryFn: fishingApi.getCaughtFish,
  })
}

export function useCaughtSpeciesIds() {
  return useQuery({
    queryKey: ['fishing', 'caughtSpeciesIds'],
    queryFn: fishingApi.getCaughtSpeciesIds,
  })
}

// ============== EQUIPMENT ==============

export function useFishingRods() {
  return useQuery({
    queryKey: ['fishing', 'rods'],
    queryFn: fishingApi.getRods,
  })
}

export function useEquippedRod() {
  return useQuery({
    queryKey: ['fishing', 'equippedRod'],
    queryFn: fishingApi.getEquippedRod,
  })
}

export function useFishingBaits() {
  return useQuery({
    queryKey: ['fishing', 'baits'],
    queryFn: fishingApi.getBaits,
  })
}

export function useFishingLocations() {
  return useQuery({
    queryKey: ['fishing', 'locations'],
    queryFn: fishingApi.getLocations,
  })
}

// ============== UPGRADES & PROGRESS ==============

export function useFishingUpgrades() {
  return useQuery({
    queryKey: ['fishing', 'upgrades'],
    queryFn: fishingApi.getUpgrades,
  })
}

export function useFishingUpgradesWithDetails() {
  return useQuery({
    queryKey: ['fishing', 'upgradesWithDetails'],
    queryFn: fishingApi.getUpgradesWithDetails,
  })
}

export function useFishingStats() {
  return useQuery({
    queryKey: ['fishing', 'stats'],
    queryFn: fishingApi.getStats,
  })
}

export function useFishingProgress() {
  return useQuery({
    queryKey: ['fishing', 'progress'],
    queryFn: fishingApi.getProgress,
  })
}

// ============== MUTATIONS ==============

export function usePurchaseRod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rodId: string) => fishingApi.purchaseRod(rodId),
    onSuccess: () => {
      audioManager.playSfx('purchase_success')
      queryClient.invalidateQueries({ queryKey: ['fishing', 'rods'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

export function useEquipRod() {
  const queryClient = useQueryClient()
  const setEquippedRod = useFishingStore((s) => s.setEquippedRod)

  return useMutation({
    mutationFn: (rodId: string) => fishingApi.equipRod(rodId),
    onSuccess: (rod) => {
      setEquippedRod(rod.id)
      queryClient.invalidateQueries({ queryKey: ['fishing', 'rods'] })
      queryClient.invalidateQueries({ queryKey: ['fishing', 'equippedRod'] })
    },
  })
}

export function usePurchaseBait() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ baitId, quantity }: { baitId: string; quantity: number }) =>
      fishingApi.purchaseBait(baitId, quantity),
    onSuccess: () => {
      audioManager.playSfx('purchase_success')
      queryClient.invalidateQueries({ queryKey: ['fishing', 'baits'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

export function useUnlockLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (locationId: string) => fishingApi.unlockLocation(locationId),
    onSuccess: () => {
      audioManager.playSfx('purchase_success')
      queryClient.invalidateQueries({ queryKey: ['fishing', 'locations'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

export function usePurchaseFishingUpgrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type: FishingUpgradeType) => fishingApi.purchaseUpgrade(type),
    onSuccess: () => {
      audioManager.playSfx('upgrade_purchase')
      queryClient.invalidateQueries({ queryKey: ['fishing', 'upgrades'] })
      queryClient.invalidateQueries({ queryKey: ['fishing', 'upgradesWithDetails'] })
      queryClient.invalidateQueries({ queryKey: ['fishing', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

// ============== GAME ACTIONS ==============

export function useSelectRandomFish() {
  const store = useFishingStore()

  return useMutation({
    mutationFn: ({ locationId, baitId }: { locationId: string; baitId?: string }) =>
      fishingApi.selectRandomFish(locationId, baitId),
    onSuccess: (data) => {
      store.fishBite(data.species, data.size)
    },
  })
}

export function useCatchFish() {
  const queryClient = useQueryClient()
  const store = useFishingStore()

  return useMutation({
    mutationFn: ({
      speciesId,
      size,
      locationId,
      rodId,
      baitId,
    }: {
      speciesId: string
      size: number
      locationId: string
      rodId: string
      baitId?: string
    }) => fishingApi.catchFish(speciesId, size, locationId, rodId, baitId),
    onSuccess: (result) => {
      store.catchSuccess(result)
      queryClient.invalidateQueries({ queryKey: ['fishing', 'caughtFish'] })
      queryClient.invalidateQueries({ queryKey: ['fishing', 'caughtSpeciesIds'] })
      queryClient.invalidateQueries({ queryKey: ['fishing', 'progress'] })
      queryClient.invalidateQueries({ queryKey: ['fishing', 'baits'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

export function useFailCatch() {
  const queryClient = useQueryClient()
  const store = useFishingStore()

  return useMutation({
    mutationFn: () => fishingApi.failCatch(),
    onSuccess: () => {
      store.catchFailure()
      queryClient.invalidateQueries({ queryKey: ['fishing', 'progress'] })
    },
  })
}
