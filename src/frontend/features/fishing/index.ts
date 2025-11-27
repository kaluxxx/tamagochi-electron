// Components
export { FishingGame } from './components/fishing-game'
export { CatchingMinigame } from './components/catching-minigame'
export { EquipmentPanel } from './components/equipment'
export { LocationSelector } from './components/location-selector'
export { FishCatalog } from './components/fish-catalog'
export { FishingUpgradesPanel } from './components/fishing-upgrades-panel'

// Services
export { fishingApi } from './services/fishing-api'

// Stores
export { useFishingStore, QTE_CONFIG } from './stores/fishing.store'

// Hooks
export {
  useFishSpecies,
  useCaughtFish,
  useCaughtSpeciesIds,
  useFishingRods,
  useEquippedRod,
  useFishingBaits,
  useFishingLocations,
  useFishingUpgrades,
  useFishingUpgradesWithDetails,
  useFishingStats,
  useFishingProgress,
  usePurchaseRod,
  useEquipRod,
  usePurchaseBait,
  useUnlockLocation,
  usePurchaseFishingUpgrade,
  useSelectRandomFish,
  useCatchFish,
  useFailCatch,
} from './hooks/use-fishing'

// Types
export type {
  FishRarity,
  FishingUpgradeType,
  FishingGameState,
  FishSpecies,
  FishCatch,
  FishingRod,
  FishingBait,
  FishingLocation,
  FishingUpgrade,
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
} from './types'
