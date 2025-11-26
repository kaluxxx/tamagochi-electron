import { useFishingLocations, useUnlockLocation } from '../../hooks/use-fishing'
import { cn } from '@frontend/shared/lib/utils'

interface LocationsTabProps {
  coins: number
}

export function LocationsTab({ coins }: LocationsTabProps) {
  const { data: locations, isLoading } = useFishingLocations()
  const unlockLocation = useUnlockLocation()

  if (isLoading) {
    return <div className="text-center text-gray-400 font-pixel text-xs py-4">Chargement...</div>
  }

  return (
    <div className="space-y-2">
      {locations?.map((location) => (
        <div
          key={location.id}
          className={cn(
            "p-3 rounded-lg border-2 transition-all",
            location.isUnlocked
              ? "bg-green-900/20 border-green-700/50"
              : "bg-gray-900/30 border-gray-700/50 opacity-75"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{location.emoji}</span>
              <div>
                <div className="font-pixel text-sm text-white">{location.displayName}</div>
                <div className="text-xs text-gray-400">
                  Difficulte: {'⭐'.repeat(location.difficulty)}
                </div>
              </div>
            </div>

            {location.isUnlocked ? (
              <span className="px-2 py-1 bg-green-600/50 text-green-200 font-pixel text-xs rounded">
                DEBLOQUE
              </span>
            ) : (
              <button
                onClick={() => unlockLocation.mutate(location.id)}
                disabled={unlockLocation.isPending || coins < location.unlockCost}
                className={cn(
                  "px-3 py-1 font-pixel text-xs rounded transition-colors",
                  coins >= location.unlockCost
                    ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                )}
              >
                {location.unlockCost} 💰
              </button>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">{location.description}</div>
        </div>
      ))}
    </div>
  )
}
