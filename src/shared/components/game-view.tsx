import { StatsPanel } from '@/features/animals/components/stats-panel'
import { GameZone } from '@/features/animals/components/game-zone'
import { ActionsPanel } from '@/features/actions/components/actions-panel'
import { useActions } from '@/features/actions/hooks/use-actions'
import type { Animal } from '@/features/animals/types'

interface GameViewProps {
  animal: Animal
}

export function GameView({ animal }: GameViewProps) {
  const {
    actionInProgress,
    isSleeping,
    sleepProgress,
    isPlaying,
    playProgress,
    activeAction,
    handleAction,
    isActionDisabled,
  } = useActions({
    animalId: animal.id,
    isAlive: animal.isAlive,
  })

  return (
    <div className="flex gap-4 h-full">
      <StatsPanel
        animal={animal}
        isSleeping={isSleeping}
        isPlaying={isPlaying}
      />

      <GameZone
        animal={animal}
        activeAction={activeAction}
        isSleeping={isSleeping}
        sleepProgress={sleepProgress}
        isPlaying={isPlaying}
        playProgress={playProgress}
      />

      <ActionsPanel
        onAction={handleAction}
        isDisabled={isActionDisabled}
        actionInProgress={actionInProgress}
        isSleeping={isSleeping}
        isPlaying={isPlaying}
      />
    </div>
  )
}
