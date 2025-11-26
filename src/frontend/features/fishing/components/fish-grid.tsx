import { cn } from '@frontend/shared/lib/utils'
import { RARITY_COLORS, RARITY_BG } from '../constants/rarity'
import type { FishRarity, FishSpecies, CaughtFishStats } from '../types'

interface FishGridProps {
  species: FishSpecies[]
  caughtSet: Set<string>
  caughtStats: Map<string, CaughtFishStats>
  selectedFishId: string | null
  onSelectFish: (fishId: string) => void
}

export function FishGrid({
  species,
  caughtSet,
  caughtStats,
  selectedFishId,
  onSelectFish
}: FishGridProps) {
  return (
    <div className="flex-1 overflow-y-auto pixel-scrollbar">
      <div className="grid grid-cols-5 gap-2">
        {species.map((fish) => {
          const isCaught = caughtSet.has(fish.id)
          const stats = caughtStats.get(fish.id)
          const rarity = fish.rarity as FishRarity

          return (
            <button
              key={fish.id}
              onClick={() => onSelectFish(fish.id)}
              className={cn(
                "aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all p-2",
                isCaught ? RARITY_BG[rarity] : "bg-gray-900/50",
                isCaught ? RARITY_COLORS[rarity] : "border-gray-700",
                selectedFishId === fish.id && "ring-2 ring-white ring-offset-2 ring-offset-blue-950",
                !isCaught && "opacity-50"
              )}
            >
              <span className="text-3xl">
                {isCaught ? fish.emoji : '❓'}
              </span>
              {isCaught && stats && (
                <span className="text-[10px] font-pixel text-gray-400 mt-1">
                  x{stats.totalCaught}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}