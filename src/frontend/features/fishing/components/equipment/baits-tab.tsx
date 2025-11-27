import { useState } from 'react'
import { useFishingBaits, usePurchaseBait } from '../../hooks/use-fishing'
import { cn } from '@frontend/shared/lib/utils'

interface BaitsTabProps {
  coins: number
}

export function BaitsTab({ coins }: BaitsTabProps) {
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
