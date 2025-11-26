import { SpriteImage } from '@frontend/shared/ui/sprite-image'
import { cn } from '@frontend/shared/lib/utils'

interface StatItemProps {
  icon: string
  value: number
  color: string
}

/**
 * Item de stat avec sprite et barre de progression
 */
export function StatItem({ icon, value, color }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <SpriteImage
        src={icon}
        alt="stat"
        size="sm"
        pixelated
        className="w-6 h-6 flex-shrink-0"
      />
      <div className="flex-1 space-y-1">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300">
          <div
            className={cn('h-full transition-all duration-500', color)}
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-text-secondary">
          {Math.floor(value)}/100
        </span>
      </div>
    </div>
  )
}