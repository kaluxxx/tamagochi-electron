// Types pour le mini-jeu de peche

import type { Wallet } from '../../economy/types'

// Enums
export type FishRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type FishingUpgradeType = 'luck' | 'reflexes' | 'value' | 'bait_efficiency'
export type FishingGameState = 'idle' | 'casting' | 'waiting' | 'bite' | 'catching' | 'success' | 'failure' | 'reward'

// Fish Species
export interface FishSpecies {
  id: string
  name: string
  displayName: string
  emoji: string
  rarity: FishRarity
  baseValue: number
  difficulty: number
  minSize: number
  maxSize: number
  locations: string // JSON array
  baitPreference: string // JSON array
  description: string
}

// Fish Catch
export interface FishCatch {
  id: string
  speciesId: string
  size: number
  coinsEarned: number
  isFirstCatch: boolean
  caughtAt: Date
  locationId: string
  rodId: string
  baitId: string | null
  species: FishSpecies
}

// Equipment
export interface FishingRod {
  id: string
  name: string
  displayName: string
  tier: number
  price: number
  reelZoneBonus: number
  catchRateBonus: number
  rarityBonus: number
  description: string
  isOwned: boolean
  isEquipped: boolean
}

export interface FishingBait {
  id: string
  name: string
  displayName: string
  emoji: string
  price: number
  catchRateBonus: number
  maxUses: number
  targetRarity: string | null // JSON array
  targetSpecies: string | null // JSON array
  description: string
  quantity: number
}

export interface FishingLocation {
  id: string
  name: string
  displayName: string
  emoji: string
  unlockCost: number
  difficulty: number
  availableFish: string // JSON array
  description: string
  isUnlocked: boolean
  unlockOrder: number
}

// Upgrades & Progress
export interface FishingUpgrade {
  id: string
  type: FishingUpgradeType
  level: number
  createdAt: Date
  updatedAt: Date
}

export interface FishingProgress {
  id: string
  level: number
  experience: number
  totalFishCaught: number
  largestFishId: string | null
  largestFishSize: number | null
  currentStreak: number
  bestStreak: number
  createdAt: Date
  updatedAt: Date
}

export interface FishingStats {
  luckBonus: number
  reflexBonus: number
  valueBonus: number
  baitEfficiencyBonus: number
}

export interface FishingUpgradeWithDetails {
  type: FishingUpgradeType
  level: number
  displayName: string
  description: string
  currentEffect: number
  nextEffect: number
  effectPerLevel: number
  cost: number
}

// Catalog
export interface CaughtFishStats {
  species: FishSpecies
  totalCaught: number
  largestSize: number
  firstCatchDate: Date
}

// Game Results
export interface SelectedFish {
  species: FishSpecies
  size: number
}

export interface CatchFishResult {
  catch: FishCatch
  wallet: Wallet
  progress: FishingProgress
  species: FishSpecies
  coinsEarned: number
  xpEarned: number
  isFirstCatch: boolean
}

export interface FailCatchResult {
  progress: FishingProgress
}

// Purchase Results
export interface PurchaseRodResult {
  wallet: Wallet
  rod: FishingRod
}

export interface PurchaseBaitResult {
  wallet: Wallet
  bait: FishingBait
  cost: number
}

export interface UnlockLocationResult {
  wallet: Wallet
  location: FishingLocation
}

export interface PurchaseFishingUpgradeResult {
  wallet: Wallet
  upgrade: FishingUpgrade
  cost: number
}
