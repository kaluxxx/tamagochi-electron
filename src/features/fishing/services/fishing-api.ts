import type {
  FishSpecies,
  FishingRod,
  FishingBait,
  FishingLocation,
  FishingUpgrade,
  FishingUpgradeType,
  FishingUpgradeWithDetails,
  FishingProgress,
  FishingStats,
  CaughtFishStats,
  SelectedFish,
  CatchFishResult,
  FailCatchResult,
  PurchaseRodResult,
  PurchaseBaitResult,
  UnlockLocationResult,
  PurchaseFishingUpgradeResult,
} from '../types'

export const fishingApi = {
  // Species & Catalog
  getAllSpecies: async (): Promise<FishSpecies[]> => {
    return window.api.fishing.getAllSpecies()
  },

  getSpeciesById: async (id: string): Promise<FishSpecies | null> => {
    return window.api.fishing.getSpeciesById(id)
  },

  getCaughtFish: async (): Promise<CaughtFishStats[]> => {
    return window.api.fishing.getCaughtFish()
  },

  getCaughtSpeciesIds: async (): Promise<string[]> => {
    return window.api.fishing.getCaughtSpeciesIds()
  },

  // Game Actions
  selectRandomFish: async (locationId: string, baitId?: string): Promise<SelectedFish> => {
    return window.api.fishing.selectRandomFish(locationId, baitId)
  },

  catchFish: async (
    speciesId: string,
    size: number,
    locationId: string,
    rodId: string,
    baitId?: string
  ): Promise<CatchFishResult> => {
    return window.api.fishing.catchFish(speciesId, size, locationId, rodId, baitId)
  },

  failCatch: async (): Promise<FailCatchResult> => {
    return window.api.fishing.failCatch()
  },

  // Rods
  getRods: async (): Promise<FishingRod[]> => {
    return window.api.fishing.getRods()
  },

  getEquippedRod: async (): Promise<FishingRod | null> => {
    return window.api.fishing.getEquippedRod()
  },

  purchaseRod: async (rodId: string): Promise<PurchaseRodResult> => {
    return window.api.fishing.purchaseRod(rodId)
  },

  equipRod: async (rodId: string): Promise<FishingRod> => {
    return window.api.fishing.equipRod(rodId)
  },

  // Baits
  getBaits: async (): Promise<FishingBait[]> => {
    return window.api.fishing.getBaits()
  },

  purchaseBait: async (baitId: string, quantity: number): Promise<PurchaseBaitResult> => {
    return window.api.fishing.purchaseBait(baitId, quantity)
  },

  // Locations
  getLocations: async (): Promise<FishingLocation[]> => {
    return window.api.fishing.getLocations()
  },

  unlockLocation: async (locationId: string): Promise<UnlockLocationResult> => {
    return window.api.fishing.unlockLocation(locationId)
  },

  // Upgrades
  getUpgrades: async (): Promise<FishingUpgrade[]> => {
    return window.api.fishing.getUpgrades()
  },

  getUpgradesWithDetails: async (): Promise<FishingUpgradeWithDetails[]> => {
    return window.api.fishing.getUpgradesWithDetails()
  },

  purchaseUpgrade: async (type: FishingUpgradeType): Promise<PurchaseFishingUpgradeResult> => {
    return window.api.fishing.purchaseUpgrade(type)
  },

  getStats: async (): Promise<FishingStats> => {
    return window.api.fishing.getStats()
  },

  // Progress
  getProgress: async (): Promise<FishingProgress> => {
    return window.api.fishing.getProgress()
  },
}
