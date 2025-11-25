// Types pour l'API Electron exposée via Context Bridge

export interface AnimalType {
  id: string
  name: string
  displayName: string
  hungerDecayRate: number
  happinessDecayRate: number
  energyDecayRate: number
  healthDecayRate: number
  emoji: string
}

export interface Animal {
  id: string
  name: string
  typeId: string
  hunger: number
  happiness: number
  health: number
  energy: number
  age: number
  createdAt: Date
  updatedAt: Date
  isAlive: boolean
  type: AnimalType
}

export interface Action {
  id: string
  animalId: string
  actionType: string
  itemId?: string | null
  timestamp: Date
  // Stats delta
  hungerBefore?: number | null
  happinessBefore?: number | null
  healthBefore?: number | null
  energyBefore?: number | null
  hungerAfter?: number | null
  happinessAfter?: number | null
  healthAfter?: number | null
  energyAfter?: number | null
  item?: Item | null
}

export interface ActionWithDelta extends Action {
  item?: Item | null
}

export interface InventoryItem {
  id: string
  itemId: string
  quantity: number
  item: Item
}

export interface Item {
  id: string
  name: string
  type: string
  hungerBoost: number
  happinessBoost: number
  healthBoost: number
  energyBoost: number
  energyCost: number
  price: number
  emoji: string
  description: string
}

// Economy System Types
export interface Wallet {
  id: string
  coins: number
  lastPassiveGain: Date
  createdAt: Date
}

export interface ShopItem extends Item {
  price: number
}

export interface PurchaseResult {
  wallet: Wallet
  inventory: InventoryItem
  item: Item
}

export interface MinigameScore {
  id: string
  gameType: string
  score: number
  coinsEarned: number
  playedAt: Date
}

export interface MinigameResult {
  score: MinigameScore
  wallet: Wallet
}

// Clicker Upgrades Types
export type UpgradeType = 'multiplier' | 'time_bonus' | 'auto_clicker'

export interface ClickerUpgrade {
  id: string
  type: UpgradeType
  level: number
  createdAt: Date
  updatedAt: Date
}

export interface ClickerGameStats {
  multiplier: number
  gameDuration: number
  autoClicksPerSecond: number
}

export interface PurchaseUpgradeResult {
  wallet: Wallet
  upgrade: ClickerUpgrade
  cost: number
}

export interface CreateAnimalInput {
  name: string
  typeId: string
}

export interface ActionResult {
  animal: Animal
  coinsEarned: number
}

export interface TickResult {
  animal: Animal
  justDied: boolean
  criticalStats: {
    hunger: boolean
    happiness: boolean
    energy: boolean
    health: boolean
  }
}

declare global {
  interface Window {
    api: {
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
      // Economy System
      wallet: {
        get: () => Promise<Wallet>
        collectPassive: () => Promise<Wallet>
        addCoins: (amount: number) => Promise<Wallet>
      }
      shop: {
        getItems: () => Promise<ShopItem[]>
        purchase: (itemId: string, quantity?: number) => Promise<PurchaseResult>
      }
      minigame: {
        saveScore: (gameType: string, score: number, coinsEarned: number) => Promise<MinigameResult>
        getHighScores: (gameType: string) => Promise<MinigameScore[]>
      }
      clickerUpgrades: {
        getAll: () => Promise<ClickerUpgrade[]>
        purchase: (type: UpgradeType) => Promise<PurchaseUpgradeResult>
        getGameStats: () => Promise<ClickerGameStats>
      }
      // Event listeners for Main → Renderer communication
      onAnimalsUpdated: (callback: () => void) => () => void
      onAnimalDied: (callback: (animal: Animal) => void) => () => void
      onWalletUpdated: (callback: (wallet: Wallet) => void) => () => void
    }
  }
}

export {}
