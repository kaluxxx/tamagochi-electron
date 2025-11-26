import { cn } from '@frontend/shared/lib/utils'
import { getRarityColor } from '../../utils/rarity-helpers'
import type { FishSpecies } from '../../types'

interface FailureStateProps {
  currentFish: FishSpecies | null
  onPlayAgain: () => void
}

export function FailureState({ currentFish, onPlayAgain }: FailureStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-6xl">💨</div>
      <div className="text-2xl font-pixel text-red-400">
        LE POISSON S'EST ECHAPPE!
      </div>

      {currentFish && (
        <div className="text-center opacity-50">
          <div className="text-4xl">{currentFish.emoji}</div>
          <div className={cn("font-pixel", getRarityColor(currentFish.rarity))}>
            {currentFish.displayName}
          </div>
        </div>
      )}

      <button
        onClick={onPlayAgain}
        className="mt-4 px-8 py-3 bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white rounded-xl font-pixel text-lg transition-all transform hover:scale-105 active:scale-95"
      >
        REESSAYER
      </button>
    </div>
  )
}
