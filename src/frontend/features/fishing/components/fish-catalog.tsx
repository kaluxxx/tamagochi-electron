import { useState } from 'react'
import { useFishSpecies, useCaughtFish, useCaughtSpeciesIds } from '../hooks/use-fishing'
import { cn } from '@frontend/shared/lib/utils'
import type { FishRarity } from '../types'

const RARITY_ORDER: FishRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

const RARITY_LABELS: Record<FishRarity, string> = {
  common: 'Commun',
  uncommon: 'Peu commun',
  rare: 'Rare',
  epic: 'Epique',
  legendary: 'Legendaire',
}

const RARITY_COLORS: Record<FishRarity, string> = {
  common: 'text-gray-300 border-gray-500',
  uncommon: 'text-green-400 border-green-500',
  rare: 'text-blue-400 border-blue-500',
  epic: 'text-purple-400 border-purple-500',
  legendary: 'text-yellow-400 border-yellow-500',
}

const RARITY_BG: Record<FishRarity, string> = {
  common: 'bg-gray-800/50',
  uncommon: 'bg-green-900/30',
  rare: 'bg-blue-900/30',
  epic: 'bg-purple-900/30',
  legendary: 'bg-yellow-900/30',
}

export function FishCatalog() {
  const { data: allSpecies, isLoading: speciesLoading } = useFishSpecies()
  const { data: caughtFish, isLoading: caughtLoading } = useCaughtFish()
  const { data: caughtIds, isLoading: idsLoading } = useCaughtSpeciesIds()
  const [selectedRarity, setSelectedRarity] = useState<FishRarity | 'all'>('all')
  const [selectedFish, setSelectedFish] = useState<string | null>(null)

  const isLoading = speciesLoading || caughtLoading || idsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-pixel text-blue-300 animate-pulse">
          Chargement du catalogue...
        </div>
      </div>
    )
  }

  const caughtSet = new Set(caughtIds ?? [])
  const caughtStats = new Map(caughtFish?.map((c) => [c.species.id, c]))

  // Filter species by rarity
  const filteredSpecies = allSpecies?.filter((s) =>
    selectedRarity === 'all' ? true : s.rarity === selectedRarity
  ) ?? []

  // Sort by rarity order then name
  const sortedSpecies = [...filteredSpecies].sort((a, b) => {
    const rarityDiff = RARITY_ORDER.indexOf(a.rarity as FishRarity) - RARITY_ORDER.indexOf(b.rarity as FishRarity)
    if (rarityDiff !== 0) return rarityDiff
    return a.displayName.localeCompare(b.displayName)
  })

  const totalCaught = caughtSet.size
  const totalSpecies = allSpecies?.length ?? 0
  const completionPercent = totalSpecies > 0 ? Math.round((totalCaught / totalSpecies) * 100) : 0

  // Get selected fish details
  const selectedFishData = selectedFish ? allSpecies?.find((s) => s.id === selectedFish) : null
  const selectedFishStats = selectedFish ? caughtStats.get(selectedFish) : null

  return (
    <div className="flex flex-col h-full">
      {/* Header with completion */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-pixel text-blue-300">CATALOGUE</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm font-pixel text-gray-400">
            {totalCaught}/{totalSpecies}
          </div>
          <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="text-sm font-pixel text-cyan-400">{completionPercent}%</div>
        </div>
      </div>

      {/* Rarity filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedRarity('all')}
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
            onClick={() => setSelectedRarity(rarity)}
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

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Fish grid */}
        <div className="flex-1 overflow-y-auto pixel-scrollbar">
          <div className="grid grid-cols-5 gap-2">
            {sortedSpecies.map((species) => {
              const isCaught = caughtSet.has(species.id)
              const stats = caughtStats.get(species.id)
              const rarity = species.rarity as FishRarity

              return (
                <button
                  key={species.id}
                  onClick={() => setSelectedFish(species.id)}
                  className={cn(
                    "aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all p-2",
                    isCaught ? RARITY_BG[rarity] : "bg-gray-900/50",
                    isCaught ? RARITY_COLORS[rarity] : "border-gray-700",
                    selectedFish === species.id && "ring-2 ring-white ring-offset-2 ring-offset-blue-950",
                    !isCaught && "opacity-50"
                  )}
                >
                  <span className="text-3xl">
                    {isCaught ? species.emoji : '❓'}
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

        {/* Fish details panel */}
        <div className="w-64 shrink-0">
          {selectedFishData ? (
            <div className={cn(
              "h-full rounded-xl border-2 p-4",
              caughtSet.has(selectedFishData.id)
                ? `${RARITY_BG[selectedFishData.rarity as FishRarity]} ${RARITY_COLORS[selectedFishData.rarity as FishRarity]}`
                : "bg-gray-900/50 border-gray-700"
            )}>
              {caughtSet.has(selectedFishData.id) ? (
                <>
                  <div className="text-center">
                    <span className="text-6xl">{selectedFishData.emoji}</span>
                    <h3 className="font-pixel text-lg mt-2">{selectedFishData.displayName}</h3>
                    <span className={cn(
                      "inline-block px-2 py-1 rounded text-xs font-pixel mt-1",
                      RARITY_BG[selectedFishData.rarity as FishRarity]
                    )}>
                      {RARITY_LABELS[selectedFishData.rarity as FishRarity]}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valeur</span>
                      <span className="text-yellow-400">{selectedFishData.baseValue} 💰</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Difficulte</span>
                      <span className="text-orange-400">{'⭐'.repeat(selectedFishData.difficulty)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Taille</span>
                      <span className="text-cyan-400">{selectedFishData.minSize}-{selectedFishData.maxSize} cm</span>
                    </div>
                  </div>

                  {selectedFishStats && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2 text-sm">
                      <div className="text-gray-400 font-pixel text-xs">VOS STATS</div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Captures</span>
                        <span className="text-white">{selectedFishStats.totalCaught}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plus grand</span>
                        <span className="text-cyan-400">{selectedFishStats.largestSize} cm</span>
                      </div>
                    </div>
                  )}

                  <p className="mt-4 text-xs text-gray-400">{selectedFishData.description}</p>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <span className="text-6xl opacity-30">❓</span>
                  <p className="mt-4 text-gray-500 font-pixel text-sm">
                    Poisson non decouvert
                  </p>
                  <p className="mt-2 text-gray-600 text-xs">
                    Continuez a pecher pour le trouver !
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full rounded-xl border-2 border-gray-700 bg-gray-900/50 flex items-center justify-center">
              <p className="text-gray-500 font-pixel text-sm text-center px-4">
                Selectionnez un poisson pour voir ses details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
