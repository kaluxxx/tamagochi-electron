import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { StatsPanel } from '@frontend/features/animals/components/stats-panel.tsx'
import { AnimalView } from '@frontend/features/animals/components/animal-view.tsx'
import { ActionsPanel } from '@frontend/features/actions/components/actions-panel.tsx'
import { useActions } from '@frontend/features/actions/hooks/use-actions.ts'
import { InventoryPanel } from '@frontend/features/inventory/components/inventory-panel.tsx'
import { HistoryPanel } from '@frontend/features/history/components/history-panel.tsx'
import { CollapsiblePanel } from '@frontend/shared/ui/collapsible-panel.tsx'
import type { Animal } from '@frontend/features/animals/types'

type LeftPanel = 'stats' | 'history' | null
type RightPanel = 'actions' | 'inventory' | null

interface AnimalGameViewProps {
  animal: Animal
}

export function GameView({ animal }: AnimalGameViewProps) {
  const queryClient = useQueryClient()
  const [leftPanel, setLeftPanel] = useState<LeftPanel>('stats')
  const [rightPanel, setRightPanel] = useState<RightPanel>('actions')

  const toggleLeftPanel = (panel: LeftPanel) => {
    setLeftPanel((current) => (current === panel ? null : panel))
  }

  const toggleRightPanel = (panel: RightPanel) => {
    setRightPanel((current) => (current === panel ? null : panel))
  }

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
    canPlay,
    canSleep,
  } = useActions({
    animalId: animal.id,
    isAlive: animal.isAlive,
    energy: animal.energy,
  })

  const handleItemUsed = () => {
    // Refresh animal data after using an item
    queryClient.invalidateQueries({ queryKey: ['animals'] })
    queryClient.invalidateQueries({ queryKey: ['history', animal.id] })
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Left Column: Stats + History - collapsible */}
      <div className="flex flex-col gap-2 h-full w-72">
        <CollapsiblePanel
          title="Stats"
          isOpen={leftPanel === 'stats'}
          onToggle={() => toggleLeftPanel('stats')}
        >
          <StatsPanel
            animal={animal}
            isSleeping={isSleeping}
            isPlaying={isPlaying}
          />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Historique"
          isOpen={leftPanel === 'history'}
          onToggle={() => toggleLeftPanel('history')}
        >
          <HistoryPanel animalId={animal.id} />
        </CollapsiblePanel>
      </div>

      {/* Center: Game Zone */}
      <AnimalView
        animal={animal}
        activeAction={activeAction}
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

      {/* Right Column: Actions + Inventory - collapsible */}
      <div className="flex flex-col gap-2 h-full w-72">
        <CollapsiblePanel
          title="Actions"
          isOpen={rightPanel === 'actions'}
          onToggle={() => toggleRightPanel('actions')}
        >
          <ActionsPanel
            onAction={handleAction}
            isDisabled={isActionDisabled}
            actionInProgress={actionInProgress}
            isSleeping={isSleeping}
            isPlaying={isPlaying}
            isFeeding={isFeeding}
            isHealing={isHealing}
            canPlay={canPlay}
            canSleep={canSleep}
          />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Inventaire"
          isOpen={rightPanel === 'inventory'}
          onToggle={() => toggleRightPanel('inventory')}
        >
          <InventoryPanel
            animalEnergy={animal.energy}
            isAlive={animal.isAlive}
            isActionDisabled={isActionDisabled}
            onUseItem={handleUseItem}
            onItemUsed={handleItemUsed}
          />
        </CollapsiblePanel>
      </div>
    </div>
  )
}
