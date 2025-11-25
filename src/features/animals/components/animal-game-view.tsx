import { StatsPanel } from './stats-panel'
import { GameZone } from './game-zone'
import { ActionsPanel } from './actions-panel'
import { useAnimalActions } from '../hooks/use-animal-actions'
import type { Animal } from '../types'

interface AnimalGameViewProps {
  animal: Animal
}

export function AnimalGameView({ animal }: AnimalGameViewProps) {
  const {
    actionInProgress,
    isSleeping,
    sleepProgress,
    isPlaying,
    playProgress,
    activeAction,
    handleAction,
    isActionDisabled,
  } = useAnimalActions({
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
