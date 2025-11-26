import { useFishingUpgradesWithDetails, usePurchaseFishingUpgrade } from '../hooks/use-fishing'
import { useWallet } from '@/features/economy'
import { cn } from '@/shared/lib/utils'
import type { FishingUpgradeType } from '../types'

const UPGRADE_ICONS: Record<FishingUpgradeType, string> = {
  luck: '🍀',
  reflexes: '⚡',
  value: '💰',
  bait_efficiency: '🪱',
}

const UPGRADE_COLORS: Record<FishingUpgradeType, { bg: string; border: string; text: string }> = {
  luck: { bg: 'bg-green-900/30', border: 'border-green-600/50', text: 'text-green-400' },
  reflexes: { bg: 'bg-yellow-900/30', border: 'border-yellow-600/50', text: 'text-yellow-400' },
  value: { bg: 'bg-amber-900/30', border: 'border-amber-600/50', text: 'text-amber-400' },
  bait_efficiency: { bg: 'bg-orange-900/30', border: 'border-orange-600/50', text: 'text-orange-400' },
}

export function FishingUpgradesPanel() {
  const { coins } = useWallet()
  const { data: upgrades, isLoading } = useFishingUpgradesWithDetails()
  const purchaseUpgrade = usePurchaseFishingUpgrade()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-lg font-pixel text-blue-300 animate-pulse">
          Chargement des ameliorations...
        </div>
      </div>
    )
  }

  const handlePurchase = (type: FishingUpgradeType) => {
    purchaseUpgrade.mutate(type)
  }

  return (
    <div className="bg-blue-950/50 rounded-xl border-2 border-blue-900/50 p-4">
      <h2 className="text-lg font-pixel text-blue-300 mb-4">AMELIORATIONS</h2>

      <div className="grid grid-cols-2 gap-3">
        {upgrades?.map((upgrade) => {
          const colors = UPGRADE_COLORS[upgrade.type]
          const canAfford = coins >= upgrade.cost
          const icon = UPGRADE_ICONS[upgrade.type]

          return (
            <div
              key={upgrade.type}
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                colors.bg,
                colors.border
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className={cn("font-pixel text-sm", colors.text)}>
                      {upgrade.displayName}
                    </div>
                    <div className="text-xs text-gray-400 font-pixel">
                      Niveau {upgrade.level}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 mb-3">{upgrade.description}</p>

              {/* Current Effect */}
              <div className="flex items-center justify-between mb-3 p-2 bg-black/20 rounded-lg">
                <span className="text-xs text-gray-500">Effet actuel</span>
                <span className={cn("font-pixel text-sm", colors.text)}>
                  {formatEffect(upgrade.type, upgrade.currentEffect)}
                </span>
              </div>

              {/* Next Level Preview */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-gray-500">Prochain niveau</span>
                <span className="text-white font-pixel">
                  {formatEffect(upgrade.type, upgrade.nextEffect)}
                </span>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => handlePurchase(upgrade.type)}
                disabled={purchaseUpgrade.isPending || !canAfford}
                className={cn(
                  "w-full px-4 py-2 rounded-lg font-pixel text-sm transition-all flex items-center justify-center gap-2",
                  canAfford
                    ? "bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                )}
              >
                {purchaseUpgrade.isPending ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <span>AMELIORER</span>
                    <span className="text-yellow-300">{upgrade.cost} 💰</span>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatEffect(type: FishingUpgradeType, value: number): string {
  switch (type) {
    case 'luck':
      return `+${value}%`
    case 'reflexes':
      return `+${value.toFixed(1)}s`
    case 'value':
      return `+${value}%`
    case 'bait_efficiency':
      return `+${value}`
    default:
      return `${value}`
  }
}
