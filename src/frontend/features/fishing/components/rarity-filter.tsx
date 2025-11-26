import { cn } from '@frontend/shared/lib/utils'
import { RARITY_ORDER, RARITY_LABELS, RARITY_COLORS, RARITY_BG } from '../constants/rarity'
import type { FishRarity } from '../types'

interface RarityFilterProps {
  selectedRarity: FishRarity | 'all'
  onSelectRarity: (rarity: FishRarity | 'all') => void
}

export function RarityFilter({ selectedRarity, onSelectRarity }: RarityFilterProps) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      <button
        onClick={() => onSelectRarity('all')}
        className={cn(
          "px-3 py-1 rounded-lg font-pixel text-xs transition-colors",
          selectedRarity === 'all'
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
        )}
      >
        Tous
      </button>
      {RARITY_ORDER.map((rarity) => (
        <button
          key={rarity}
          onClick={() => onSelectRarity(rarity)}
          className={cn(
            "px-3 py-1 rounded-lg font-pixel text-xs transition-colors",
            selectedRarity === rarity
              ? `${RARITY_BG[rarity]} ${RARITY_COLORS[rarity].split(' ')[0]}`
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          )}
        >
          {RARITY_LABELS[rarity]}
        </button>
      ))}
    </div>
  )
}