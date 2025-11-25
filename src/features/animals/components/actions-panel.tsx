import { SpriteImage } from '@/shared/components/ui/sprite-image'
import { getActionSprite } from '@/shared/utils/sprite-loader'
import { cn } from '@/shared/lib/utils'
import type { ActionType } from '../hooks/use-animal-actions'

interface ActionsPanelProps {
  onAction: (action: ActionType) => void
  isDisabled: boolean
  actionInProgress: ActionType | null
  isSleeping: boolean
  isPlaying: boolean
}

interface ActionButtonProps {
  label: string
  activeLabel: string
  icon: string
  onClick: () => void
  isDisabled: boolean
  isActive: boolean
}

function ActionButton({ label, activeLabel, icon, onClick, isDisabled, isActive }: ActionButtonProps) {
  return (
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
  )
}

export function ActionsPanel({
  onAction,
  isDisabled,
  actionInProgress,
  isSleeping,
  isPlaying,
}: ActionsPanelProps) {
  return (
    <div className="w-72 bg-[#FFF4E6] border-4 border-black pixel-panel p-4 flex flex-col">
      <div className="border-b-4 border-black pb-3 mb-4">
        <h2 className="font-pixel text-[12px] text-black text-center uppercase tracking-wider">
          Actions
        </h2>
      </div>

      <div className="space-y-3 flex-1">
        <ActionButton
          label="NOURRIR"
          activeLabel="EN COURS..."
          icon={getActionSprite('feed')}
          onClick={() => onAction('feed')}
          isDisabled={isDisabled}
          isActive={actionInProgress === 'feed'}
        />

        <ActionButton
          label="JOUER"
          activeLabel="JOUE..."
          icon={getActionSprite('play')}
          onClick={() => onAction('play')}
          isDisabled={isDisabled}
          isActive={isPlaying}
        />

        <ActionButton
          label="DORMIR"
          activeLabel="DORT..."
          icon={getActionSprite('sleep')}
          onClick={() => onAction('sleep')}
          isDisabled={isDisabled}
          isActive={isSleeping}
        />

        <ActionButton
          label="SOIGNER"
          activeLabel="EN COURS..."
          icon={getActionSprite('heal')}
          onClick={() => onAction('heal')}
          isDisabled={isDisabled}
          isActive={actionInProgress === 'heal'}
        />
      </div>
    </div>
  )
}
