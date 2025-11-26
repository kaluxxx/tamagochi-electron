import { useState } from 'react'
import {
  useFishingRods,
  useFishingBaits,
  useFishingLocations,
  usePurchaseRod,
  useEquipRod,
  usePurchaseBait,
  useUnlockLocation,
} from '../hooks/use-fishing'
import { useWallet } from '@frontend/features/economy'
import { cn } from '@frontend/shared/lib/utils'

type Tab = 'rods' | 'baits' | 'locations'

export function EquipmentPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('rods')
  const { coins } = useWallet()

  return (
    <div className="bg-blue-950/50 rounded-xl border-2 border-blue-900/50 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-blue-900/50">
        {(['rods', 'baits', 'locations'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 px-4 py-2 font-pixel text-xs transition-colors",
              activeTab === tab
                ? "bg-blue-800/50 text-blue-200"
                : "text-gray-400 hover:text-gray-300 hover:bg-blue-900/30"
            )}
          >
            {tab === 'rods' && '🎣 CANNES'}
            {tab === 'baits' && '🪱 APPATS'}
            {tab === 'locations' && '📍 LIEUX'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 max-h-screen overflow-y-auto pixel-scrollbar">
        {activeTab === 'rods' && <RodsTab coins={coins} />}
        {activeTab === 'baits' && <BaitsTab coins={coins} />}
        {activeTab === 'locations' && <LocationsTab coins={coins} />}
      </div>
    </div>
  )
}

function RodsTab({ coins }: { coins: number }) {
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

function BaitsTab({ coins }: { coins: number }) {
  const { data: baits, isLoading } = useFishingBaits()
  const purchaseBait = usePurchaseBait()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  if (isLoading) {
    return <div className="text-center text-gray-400 font-pixel text-xs py-4">Chargement...</div>
  }

  const getQuantity = (baitId: string) => quantities[baitId] || 5

  const handlePurchase = (baitId: string) => {
    const qty = getQuantity(baitId)
    purchaseBait.mutate({ baitId, quantity: qty })
  }

  return (
    <div className="space-y-2">
      {baits?.map((bait) => {
        const qty = getQuantity(bait.id)
        const totalCost = bait.price * qty
        const canAfford = coins >= totalCost

        return (
          <div
            key={bait.id}
            className="p-3 rounded-lg border-2 bg-yellow-900/20 border-yellow-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{bait.emoji}</span>
                <div>
                  <div className="font-pixel text-sm text-white">{bait.displayName}</div>
                  <div className="text-xs text-yellow-400">
                    En stock: {bait.quantity}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-800 rounded">
                  <button
                    onClick={() => setQuantities(q => ({ ...q, [bait.id]: Math.max(1, qty - 5) }))}
                    className="px-2 py-1 text-gray-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-pixel text-xs text-white">{qty}</span>
                  <button
                    onClick={() => setQuantities(q => ({ ...q, [bait.id]: qty + 5 }))}
                    className="px-2 py-1 text-gray-400 hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handlePurchase(bait.id)}
                  disabled={purchaseBait.isPending || !canAfford}
                  className={cn(
                    "px-3 py-1 font-pixel text-xs rounded transition-colors",
                    canAfford
                      ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {totalCost} 💰
                </button>
              </div>
            </div>

            <div className="mt-2 flex gap-4 text-xs">
              <div>
                <span className="text-gray-500">Bonus: </span>
                <span className="text-green-400">+{bait.catchRateBonus}%</span>
              </div>
              <div>
                <span className="text-gray-500">Utilisations: </span>
                <span className="text-blue-400">{bait.maxUses}</span>
              </div>
            </div>

            <div className="mt-1 text-xs text-gray-500">{bait.description}</div>
          </div>
        )
      })}
    </div>
  )
}

function LocationsTab({ coins }: { coins: number }) {
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
