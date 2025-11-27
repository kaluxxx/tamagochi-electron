import { getActionSprite } from '@frontend/shared/utils/sprite-loader'
import { ActionButton } from './action-button'
import type { ActionType } from '../types'

interface ActionsPanelProps {
  onAction: (action: ActionType) => void
  isDisabled: boolean
  actionInProgress: ActionType | null
  isSleeping: boolean
  isPlaying: boolean
  isFeeding: boolean
  isHealing: boolean
  canPlay: boolean
  canSleep: boolean
}

export function ActionsPanel({
  onAction,
  isDisabled,
  isSleeping,
  isPlaying,
  isFeeding,
  isHealing,
  canPlay,
  canSleep,
}: ActionsPanelProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="space-y-3 flex-1">
        <ActionButton
          label="NOURRIR"
          activeLabel="MANGE..."
          icon={getActionSprite('feed')}
          onClick={() => onAction('feed')}
          isDisabled={isDisabled}
          isActive={isFeeding}
        />

        <ActionButton
          label="JOUER"
          activeLabel="JOUE..."
          icon={getActionSprite('play')}
          onClick={() => onAction('play')}
          isDisabled={isDisabled || !canPlay}
          isActive={isPlaying}
          tooltip={!canPlay ? "Énergie insuffisante (min 20%)" : undefined}
        />

        <ActionButton
          label="DORMIR"
          activeLabel="DORT..."
          icon={getActionSprite('sleep')}
          onClick={() => onAction('sleep')}
          isDisabled={isDisabled || !canSleep}
          isActive={isSleeping}
          tooltip={!canSleep ? "Pas assez fatigué (max 80%)" : undefined}
        />

        <ActionButton
          label="SOIGNER"
          activeLabel="SOIGNE..."
          icon={getActionSprite('heal')}
          onClick={() => onAction('heal')}
          isDisabled={isDisabled}
          isActive={isHealing}
        />
      </div>
    </div>
  )
}
