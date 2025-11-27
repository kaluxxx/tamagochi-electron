import { cn } from '@frontend/shared/lib/utils'
import type { FishingLocation, FishingRod, FishingBait } from '../../types'

interface IdleStateProps {
  currentLocation: FishingLocation | undefined
  equippedRod: FishingRod | undefined
  currentBait: FishingBait | undefined
  availableBaits: FishingBait[]
  selectedBaitId: string | null
  onCast: () => void
  onSelectBait: (baitId: string | null) => void
}

export function IdleState({
  currentLocation,
  equippedRod,
  currentBait,
  availableBaits,
  selectedBaitId,
  onCast,
  onSelectBait,
}: IdleStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="text-6xl animate-bounce-slow">🎣</div>
      <h2 className="text-2xl font-pixel text-blue-300">PRET A PECHER?</h2>

      {/* Location selector */}
      {currentLocation && (
        <div className="text-center">
          <div className="text-sm text-gray-400 font-pixel mb-1">LIEU</div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/50 rounded-lg">
            <span className="text-2xl">{currentLocation.emoji}</span>
            <span className="font-pixel text-blue-200">{currentLocation.displayName}</span>
          </div>
        </div>
      )}

      {/* Equipment display */}
      <div className="flex gap-4">
        {equippedRod && (
          <div className="text-center">
            <div className="text-xs text-gray-400 font-pixel">CANNE</div>
            <div className="font-pixel text-cyan-300">{equippedRod.displayName}</div>
          </div>
        )}
        {currentBait && (
          <div className="text-center">
            <div className="text-xs text-gray-400 font-pixel">APPAT</div>
            <div className="flex items-center gap-1 font-pixel text-yellow-300">
              <span>{currentBait.emoji}</span>
              <span>x{currentBait.quantity}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bait selector */}
      {availableBaits.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => onSelectBait(null)}
            className={cn(
              "px-3 py-1 rounded-lg font-pixel text-sm transition-all",
              !selectedBaitId
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            )}
          >
            Sans appat
          </button>
          {availableBaits.map((bait) => (
            <button
              key={bait.id}
              onClick={() => onSelectBait(bait.id)}
              className={cn(
                "px-3 py-1 rounded-lg font-pixel text-sm transition-all flex items-center gap-1",
                selectedBaitId === bait.id
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              )}
            >
              <span>{bait.emoji}</span>
              <span>x{bait.quantity}</span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onCast}
        disabled={!equippedRod || !currentLocation}
        className={cn(
          "px-8 py-4 rounded-xl font-pixel text-xl transition-all transform",
          equippedRod && currentLocation
            ? "bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white shadow-lg hover:scale-105 active:scale-95"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        )}
      >
        LANCER!
      </button>
    </div>
  )
}
