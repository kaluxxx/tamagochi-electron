// Declaration globale de l'API Electron exposee via Context Bridge
// Les types sont definis dans leurs features respectives

import type {
  Animal,
  AnimalType,
  CreateAnimalInput,
  ActionResult,
  TickResult,
} from '../../features/animals/types'

import type {
  Item,
  InventoryItem,
} from '../../features/inventory/types'

import type {
  Action,
  ActionWithDelta,
} from '../../features/history/types'

import type {
  Wallet,
  ShopItem,
  PurchaseResult,
  MinigameScore,
  MinigameResult,
  ClickerUpgradeType,
  ClickerUpgrade,
  ClickerGameStats,
  PurchaseUpgradeResult,
} from '../../features/economy/types'

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
} from '../../features/fishing/types'

// Declaration globale de window.api
declare global {
  interface Window {
    api: {
      // Animals
      animalTypes: {
        getAll: () => Promise<AnimalType[]>
        getById: (id: string) => Promise<AnimalType | null>
      }
      animals: {
        getAll: () => Promise<Animal[]>
        getById: (id: string) => Promise<Animal | null>
        create: (data: CreateAnimalInput) => Promise<Animal>
        feed: (id: string) => Promise<ActionResult>
        play: (id: string) => Promise<ActionResult>
        heal: (id: string) => Promise<ActionResult>
        sleep: (id: string) => Promise<ActionResult>
        tick: (id: string) => Promise<TickResult>
      }
      actions: {
        getByAnimalId: (animalId: string) => Promise<Action[]>
      }

      // Inventory
      items: {
        getAll: () => Promise<Item[]>
        getById: (id: string) => Promise<Item | null>
        getByType: (type: string) => Promise<Item[]>
        useItem: (animalId: string, itemId: string) => Promise<ActionResult>
      }
      inventory: {
        getAll: () => Promise<InventoryItem[]>
        getByType: (type: string) => Promise<InventoryItem[]>
      }
      history: {
        getByAnimalId: (animalId: string, limit?: number) => Promise<ActionWithDelta[]>
      }

      // Economy
      wallet: {
        get: () => Promise<Wallet>
        collectPassive: () => Promise<Wallet>
        addCoins: (amount: number) => Promise<Wallet>
      }
      shop: {
        getItems: () => Promise<ShopItem[]>
        purchase: (itemId: string, quantity?: number) => Promise<PurchaseResult>
      }

      // Minigames
      minigame: {
        saveScore: (gameType: string, score: number, coinsEarned: number) => Promise<MinigameResult>
        getHighScores: (gameType: string) => Promise<MinigameScore[]>
      }
      clickerUpgrades: {
        getAll: () => Promise<ClickerUpgrade[]>
        purchase: (type: ClickerUpgradeType) => Promise<PurchaseUpgradeResult>
        getGameStats: () => Promise<ClickerGameStats>
      }

      // Fishing
      fishing: {
        // Species & Catalog
        getAllSpecies: () => Promise<FishSpecies[]>
        getSpeciesById: (id: string) => Promise<FishSpecies | null>
        getCaughtFish: () => Promise<CaughtFishStats[]>
        getCaughtSpeciesIds: () => Promise<string[]>
        // Game Actions
        selectRandomFish: (locationId: string, baitId?: string) => Promise<SelectedFish>
        catchFish: (speciesId: string, size: number, locationId: string, rodId: string, baitId?: string) => Promise<CatchFishResult>
        failCatch: () => Promise<FailCatchResult>
        // Rods
        getRods: () => Promise<FishingRod[]>
        getEquippedRod: () => Promise<FishingRod | null>
        purchaseRod: (rodId: string) => Promise<PurchaseRodResult>
        equipRod: (rodId: string) => Promise<FishingRod>
        // Baits
        getBaits: () => Promise<FishingBait[]>
        purchaseBait: (baitId: string, quantity: number) => Promise<PurchaseBaitResult>
        // Locations
        getLocations: () => Promise<FishingLocation[]>
        unlockLocation: (locationId: string) => Promise<UnlockLocationResult>
        // Upgrades
        getUpgrades: () => Promise<FishingUpgrade[]>
        getUpgradesWithDetails: () => Promise<FishingUpgradeWithDetails[]>
        purchaseUpgrade: (type: FishingUpgradeType) => Promise<PurchaseFishingUpgradeResult>
        getStats: () => Promise<FishingStats>
        // Progress
        getProgress: () => Promise<FishingProgress>
      }

      // Event listeners
      onAnimalsUpdated: (callback: () => void) => () => void
      onAnimalDied: (callback: (animal: Animal) => void) => () => void
      onWalletUpdated: (callback: (wallet: Wallet) => void) => () => void
    }
  }
}

export {}
