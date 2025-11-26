import { useFishingRods, usePurchaseRod, useEquipRod } from '../../hooks/use-fishing'
import { cn } from '@frontend/shared/lib/utils'

interface RodsTabProps {
  coins: number
}

export function RodsTab({ coins }: RodsTabProps) {
  const { data: rods, isLoading } = useFishingRods()
  const purchaseRod = usePurchaseRod()
  const equipRod = useEquipRod()

  if (isLoading) {
    return <div className="text-center text-gray-400 font-pixel text-xs py-4">Chargement...</div>
  }

  return (
    <div className="space-y-2">
      {rods?.map((rod) => (
        <div
          key={rod.id}
          className={cn(
            "p-3 rounded-lg border-2 transition-all",
            rod.isEquipped
              ? "bg-cyan-900/30 border-cyan-500/50"
              : rod.isOwned
              ? "bg-blue-900/30 border-blue-700/50"
              : "bg-gray-900/30 border-gray-700/50"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎣</span>
              <div>
                <div className="font-pixel text-sm text-white">{rod.displayName}</div>
                <div className="text-xs text-gray-400">Tier {rod.tier}</div>
              </div>
            </div>

            {rod.isEquipped ? (
              <span className="px-2 py-1 bg-cyan-600/50 text-cyan-200 font-pixel text-xs rounded">
                EQUIPEE
              </span>
            ) : rod.isOwned ? (
              <button
                onClick={() => equipRod.mutate(rod.id)}
                disabled={equipRod.isPending}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-pixel text-xs rounded transition-colors disabled:opacity-50"
              >
                EQUIPER
              </button>
            ) : (
              <button
                onClick={() => purchaseRod.mutate(rod.id)}
                disabled={purchaseRod.isPending || coins < rod.price}
                className={cn(
                  "px-3 py-1 font-pixel text-xs rounded transition-colors",
                  coins >= rod.price
                    ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                )}
              >
                {rod.price} 💰
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-gray-500">Zone</div>
              <div className="text-green-400">+{rod.reelZoneBonus}%</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Capture</div>
              <div className="text-blue-400">+{rod.catchRateBonus}%</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Rarete</div>
              <div className="text-purple-400">+{rod.rarityBonus}%</div>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500">{rod.description}</div>
        </div>
      ))}
    </div>
  )
}
