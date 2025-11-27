/**
 * Get text color class for a rarity level
 */
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-300'
    case 'uncommon':
      return 'text-green-400'
    case 'rare':
      return 'text-blue-400'
    case 'epic':
      return 'text-purple-400'
    case 'legendary':
      return 'text-yellow-400'
    default:
      return 'text-white'
  }
}

/**
 * Get background color class for a rarity level
 */
export function getRarityBgColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-600/50'
    case 'uncommon':
      return 'bg-green-600/50'
    case 'rare':
      return 'bg-blue-600/50'
    case 'epic':
      return 'bg-purple-600/50'
    case 'legendary':
      return 'bg-yellow-600/50 animate-pulse'
    default:
      return 'bg-gray-600/50'
  }
}
