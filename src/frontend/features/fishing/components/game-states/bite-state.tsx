import { cn } from '@frontend/shared/lib/utils'
import { QTE_CONFIG } from '../../stores/fishing.store'

interface BiteStateProps {
  reactionTimeLeft: number
  reflexBonus: number
  onClick: () => void
}

export function BiteState({ reactionTimeLeft, reflexBonus, onClick }: BiteStateProps) {
  const maxReactionTime = QTE_CONFIG.baseReactionWindow + reflexBonus / 10

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="text-6xl animate-shake">🐟</div>
      <div className="text-3xl font-pixel text-yellow-400 animate-pulse">
        TOUCHE!
      </div>
      <div className="text-lg font-pixel text-white">
        CLIQUE MAINTENANT!
      </div>

      {/* Reaction timer bar */}
      <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-50",
            reactionTimeLeft > 0.5 ? "bg-green-500" : "bg-red-500 animate-pulse"
          )}
          style={{
            width: `${(reactionTimeLeft / maxReactionTime) * 100}%`,
          }}
        />
      </div>
      <div className="text-sm font-pixel text-gray-400">
        {reactionTimeLeft.toFixed(1)}s
      </div>
    </div>
  )
}
