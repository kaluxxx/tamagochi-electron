import { useQueryClient } from '@tanstack/react-query'
import { StatsPanel } from '@/features/animals/components/stats-panel.tsx'
import { AnimalView } from '@/features/animals/components/animal-view.tsx'
import { ActionsPanel } from '@/features/animals/components/actions-panel.tsx'
import { useAnimalActions } from '@/features/animals/hooks/use-animal-actions.ts'
import { InventoryPanel } from '@/features/inventory/components/inventory-panel.tsx'
import { HistoryPanel } from '@/features/history/components/history-panel.tsx'
import type { Animal } from '@/shared/types/window'

interface AnimalGameViewProps {
  animal: Animal
}

export function GameView({ animal }: AnimalGameViewProps) {
  const queryClient = useQueryClient()

  const {
    actionInProgress,
    isSleeping,
    sleepProgress,
    isPlaying,
    playProgress,
    isFeeding,
    feedProgress,
    isHealing,
    healProgress,
    isUsingItem,
    useItemProgress,
    activeAction,
    handleAction,
    handleUseItem,
    isActionDisabled,
  } = useAnimalActions({
    animalId: animal.id,
    isAlive: animal.isAlive,
  })

  const handleItemUsed = () => {
    // Refresh animal data after using an item
    queryClient.invalidateQueries({ queryKey: ['animals'] })
    queryClient.invalidateQueries({ queryKey: ['history', animal.id] })
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Left Column: Stats + History - each 50% height */}
      <div className="flex flex-col gap-4 h-full">
        <StatsPanel
          animal={animal}
          isSleeping={isSleeping}
          isPlaying={isPlaying}
        />
        <HistoryPanel animalId={animal.id} />
      </div>

      {/* Center: Game Zone */}
      <AnimalView
        animal={animal}
        activeAction={activeAction}
        actionInProgress={actionInProgress}
        isSleeping={isSleeping}
        sleepProgress={sleepProgress}
        isPlaying={isPlaying}
        playProgress={playProgress}
        isFeeding={isFeeding}
        feedProgress={feedProgress}
        isHealing={isHealing}
        healProgress={healProgress}
        isUsingItem={isUsingItem}
        useItemProgress={useItemProgress}
      />

      {/* Right Column: Actions + Inventory - each 50% height */}
      <div className="flex flex-col gap-4 h-full">
        <ActionsPanel
          onAction={handleAction}
          isDisabled={isActionDisabled}
          actionInProgress={actionInProgress}
          isSleeping={isSleeping}
          isPlaying={isPlaying}
          isFeeding={isFeeding}
          isHealing={isHealing}
        />
        <InventoryPanel
          animalId={animal.id}
          animalEnergy={animal.energy}
          isAlive={animal.isAlive}
          isActionDisabled={isActionDisabled}
          onUseItem={handleUseItem}
          onItemUsed={handleItemUsed}
        />
      </div>
    </div>
  )
}
