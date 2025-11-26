// Types pour l'economie, le shop et les minigames

import type { Item, InventoryItem } from '../../inventory/types'

// Wallet
export interface Wallet {
  id: string
  coins: number
  lastPassiveGain: Date
  createdAt: Date
}

// Shop
export interface ShopItem extends Item {
  price: number
}

export interface PurchaseResult {
  wallet: Wallet
  inventory: InventoryItem
  item: Item
}

// Minigames
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

// Clicker Upgrades
export type ClickerUpgradeType = 'multiplier' | 'time_bonus' | 'auto_clicker'

export interface ClickerUpgrade {
  id: string
  type: ClickerUpgradeType
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
