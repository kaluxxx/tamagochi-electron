import { useFishingStore } from '../stores/fishing.store'
import { useFishingLocations } from '../hooks/use-fishing'
import { cn } from '@/shared/lib/utils'

export function LocationSelector() {
  const selectedLocationId = useFishingStore((s) => s.selectedLocationId)
  const setSelectedLocation = useFishingStore((s) => s.setSelectedLocation)
  const { data: locations, isLoading } = useFishingLocations()

  if (isLoading) {
    return (
      <div className="text-center text-gray-400 font-pixel text-xs py-2">
        Chargement...
      </div>
    )
  }

  const unlockedLocations = locations?.filter((l) => l.isUnlocked) ?? []

  if (unlockedLocations.length === 0) {
    return (
      <div className="text-center text-gray-400 font-pixel text-xs py-2">
        Aucun lieu disponible
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {unlockedLocations.map((location) => (
        <button
          key={location.id}
          onClick={() => setSelectedLocation(location.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all font-pixel text-xs",
            selectedLocationId === location.id
              ? "bg-blue-600/50 border-blue-400 text-white"
              : "bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500"
          )}
        >
          <span className="text-lg">{location.emoji}</span>
          <span>{location.displayName}</span>
        </button>
      ))}
    </div>
  )
}
