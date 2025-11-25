import { SpriteImage } from '@/shared/components/ui/sprite-image'
import { getActionSprite } from '@/shared/utils/sprite-loader'
import { cn } from '@/shared/lib/utils'
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

interface ActionButtonProps {
  label: string
  activeLabel: string
  icon: string
  onClick: () => void
  isDisabled: boolean
  isActive: boolean
  tooltip?: string
}

function ActionButton({ label, activeLabel, icon, onClick, isDisabled, isActive, tooltip }: ActionButtonProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          'w-full bg-[#87CEEB] border-4 border-black p-3 flex items-center gap-3',
          'font-pixel text-[10px] text-black uppercase',
          'transition-all active:translate-y-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:bg-[#5DADE2]'
        )}
      >
        <SpriteImage src={icon} alt={label} className="w-8 h-8" pixelated />
        <span>{isActive ? activeLabel : label}</span>
      </button>
      {tooltip && isDisabled && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 bg-black text-white text-[8px] font-pixel rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
          {tooltip}
          <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-black" />
        </div>
      )}
    </div>
  )
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
