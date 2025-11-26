import { cn } from '@frontend/shared/lib/utils'
import { RARITY_LABELS, RARITY_COLORS, RARITY_BG } from '../constants/rarity'
import type { FishRarity, FishSpecies, CaughtFishStats } from '../types'

interface FishDetailsPanelProps {
  selectedFish: FishSpecies | null
  isCaught: boolean
  stats: CaughtFishStats | undefined
}

export function FishDetailsPanel({ selectedFish, isCaught, stats }: FishDetailsPanelProps) {
  if (!selectedFish) {
    return (
      <div className="h-full rounded-xl border-2 border-gray-700 bg-gray-900/50 flex items-center justify-center">
        <p className="text-gray-500 font-pixel text-sm text-center px-4">
          Selectionnez un poisson pour voir ses details
        </p>
      </div>
    )
  }

  const rarity = selectedFish.rarity as FishRarity

  if (!isCaught) {
    return (
      <div className="h-full rounded-xl border-2 border-gray-700 bg-gray-900/50 p-4">
        <div className="h-full flex flex-col items-center justify-center text-center">
          <span className="text-6xl opacity-30">❓</span>
          <p className="mt-4 text-gray-500 font-pixel text-sm">
            Poisson non decouvert
          </p>
          <p className="mt-2 text-gray-600 text-xs">
            Continuez a pecher pour le trouver !
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "h-full rounded-xl border-2 p-4",
      RARITY_BG[rarity],
      RARITY_COLORS[rarity]
    )}>
      <div className="text-center">
        <span className="text-6xl">{selectedFish.emoji}</span>
        <h3 className="font-pixel text-lg mt-2">{selectedFish.displayName}</h3>
        <span className={cn(
          "inline-block px-2 py-1 rounded text-xs font-pixel mt-1",
          RARITY_BG[rarity]
        )}>
          {RARITY_LABELS[rarity]}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Valeur</span>
          <span className="text-yellow-400">{selectedFish.baseValue} 💰</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Difficulte</span>
          <span className="text-orange-400">{'⭐'.repeat(selectedFish.difficulty)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Taille</span>
          <span className="text-cyan-400">{selectedFish.minSize}-{selectedFish.maxSize} cm</span>
        </div>
      </div>

      {stats && (
        <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2 text-sm">
          <div className="text-gray-400 font-pixel text-xs">VOS STATS</div>
          <div className="flex justify-between">
            <span className="text-gray-400">Captures</span>
            <span className="text-white">{stats.totalCaught}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Plus grand</span>
            <span className="text-cyan-400">{stats.largestSize} cm</span>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">{selectedFish.description}</p>
    </div>
  )
}
