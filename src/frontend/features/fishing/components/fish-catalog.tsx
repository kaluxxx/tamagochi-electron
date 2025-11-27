import { useState } from 'react'
import { useFishSpecies, useCaughtFish, useCaughtSpeciesIds } from '../hooks/use-fishing'
import { RARITY_ORDER } from '../constants/rarity'
import { CatalogHeader } from './catalog-header'
import { RarityFilter } from './rarity-filter'
import { FishGrid } from './fish-grid'
import { FishDetailsPanel } from './fish-details-panel'
import type { FishRarity } from '../types'

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

    const filteredSpecies = allSpecies?.filter((s) =>
        selectedRarity === 'all' ? true : s.rarity === selectedRarity
    ) ?? []

    const sortedSpecies = [...filteredSpecies].sort((a, b) => {
        const rarityDiff = RARITY_ORDER.indexOf(a.rarity as FishRarity) - RARITY_ORDER.indexOf(b.rarity as FishRarity)
        if (rarityDiff !== 0) return rarityDiff
        return a.displayName.localeCompare(b.displayName)
    })

    const totalCaught = caughtSet.size
    const totalSpecies = allSpecies?.length ?? 0
    const completionPercent = totalSpecies > 0 ? Math.round((totalCaught / totalSpecies) * 100) : 0

    const selectedFishData = selectedFish ? allSpecies?.find((s) => s.id === selectedFish) : null
    const selectedFishStats = selectedFish ? caughtStats.get(selectedFish) : null

    return (
        <div className="flex flex-col h-full">
            <CatalogHeader
                totalCaught={totalCaught}
                totalSpecies={totalSpecies}
                completionPercent={completionPercent}
            />

            <RarityFilter
                selectedRarity={selectedRarity}
                onSelectRarity={setSelectedRarity}
            />

            <div className="flex gap-4 flex-1 min-h-0">
                <FishGrid
                    species={sortedSpecies}
                    caughtSet={caughtSet}
                    caughtStats={caughtStats}
                    selectedFishId={selectedFish}
                    onSelectFish={setSelectedFish}
                />

                <div className="w-64 shrink-0">
                    <FishDetailsPanel
                        selectedFish={selectedFishData ?? null}
                        isCaught={selectedFishData ? caughtSet.has(selectedFishData.id) : false}
                        stats={selectedFishStats ?? undefined}
                    />
                </div>
            </div>
        </div>
    )
}