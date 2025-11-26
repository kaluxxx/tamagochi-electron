import type { FishRarity } from '../types'

export const RARITY_ORDER: FishRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

export const RARITY_LABELS: Record<FishRarity, string> = {
  common: 'Commun',
  uncommon: 'Peu commun',
  rare: 'Rare',
  epic: 'Epique',
  legendary: 'Legendaire',
}

export const RARITY_COLORS: Record<FishRarity, string> = {
  common: 'text-gray-300 border-gray-500',
  uncommon: 'text-green-400 border-green-500',
  rare: 'text-blue-400 border-blue-500',
  epic: 'text-purple-400 border-purple-500',
  legendary: 'text-yellow-400 border-yellow-500',
}

export const RARITY_BG: Record<FishRarity, string> = {
  common: 'bg-gray-800/50',
  uncommon: 'bg-green-900/30',
  rare: 'bg-blue-900/30',
  epic: 'bg-purple-900/30',
  legendary: 'bg-yellow-900/30',
}
