import { cn } from '@frontend/shared/lib/utils'
import { getRarityColor, getRarityBgColor } from '../../utils/rarity-helpers'
import type { CatchFishResult } from '../../types'

interface SuccessStateProps {
  lastResult: CatchFishResult | null
  onPlayAgain: () => void
}

export function SuccessState({ lastResult, onPlayAgain }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-7xl animate-bounce">🎉</div>
      <div className="text-3xl font-pixel text-green-400">
        CAPTURE!
      </div>

      {lastResult && (
        <div className={cn(
          "p-6 rounded-xl text-center",
          getRarityBgColor(lastResult.species.rarity)
        )}>
          <div className="text-5xl mb-2">{lastResult.species.emoji}</div>
          <div className={cn("text-xl font-pixel", getRarityColor(lastResult.species.rarity))}>
            {lastResult.species.displayName}
          </div>
          <div className="text-sm text-gray-300 font-pixel mt-1">
            {lastResult.catch.size} cm
          </div>

          {lastResult.isFirstCatch && (
            <div className="mt-2 px-3 py-1 bg-yellow-500/50 rounded-full text-yellow-200 font-pixel text-sm">
              PREMIERE CAPTURE!
            </div>
          )}

          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-pixel text-yellow-400">
                +{lastResult.coinsEarned}
              </div>
              <div className="text-xs text-gray-400 font-pixel">PIECES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-pixel text-cyan-400">
                +{lastResult.xpEarned}
              </div>
              <div className="text-xs text-gray-400 font-pixel">XP</div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onPlayAgain}
        className="px-8 py-3 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white rounded-xl font-pixel text-lg transition-all transform hover:scale-105 active:scale-95"
      >
        PECHER ENCORE
      </button>
    </div>
  )
}
