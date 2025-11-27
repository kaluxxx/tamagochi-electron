import { SpriteImage } from '@frontend/shared/ui/sprite-image'
import { cn } from '@frontend/shared/lib/utils'

export interface ActionButtonProps {
  label: string
  activeLabel: string
  icon: string
  onClick: () => void
  isDisabled: boolean
  isActive: boolean
  tooltip?: string
}

export function ActionButton({ label, activeLabel, icon, onClick, isDisabled, isActive, tooltip }: ActionButtonProps) {
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