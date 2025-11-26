import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CoinDisplay } from '@/features/economy'
import {
  FishingGame,
  EquipmentPanel,
  FishCatalog,
  LocationSelector,
  FishingUpgradesPanel,
  useFishingProgress,
  useEquippedRod,
} from '@/features/fishing'
import { AudioControls } from '@/features/audio'
import { cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/minigames/fishing')({
  component: FishingPage,
})

type Tab = 'game' | 'equipment' | 'upgrades' | 'catalog'

function FishingPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('game')
  const { data: progress, isLoading: progressLoading } = useFishingProgress()
  const { data: equippedRod, isLoading: rodLoading } = useEquippedRod()

  const isLoading = progressLoading || rodLoading

  return (
    <main className="h-screen w-screen bg-gradient-to-b from-blue-900 to-slate-900 flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/minigames' })}
            className="px-3 py-1.5 bg-blue-800/50 border-2 border-blue-400/30 text-blue-200 font-pixel text-[10px] uppercase hover:bg-blue-700/50 active:translate-y-0.5 transition-all"
          >
            RETOUR
          </button>

          {/* Tabs */}
          <div className="flex gap-1 bg-blue-950/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('game')}
              className={cn(
                "px-4 py-2 font-pixel text-xs rounded-md transition-all",
                activeTab === 'game'
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-blue-800/50"
              )}
            >
              PECHE
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={cn(
                "px-4 py-2 font-pixel text-xs rounded-md transition-all",
                activeTab === 'equipment'
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-blue-800/50"
              )}
            >
              EQUIPEMENT
            </button>
            <button
              onClick={() => setActiveTab('upgrades')}
              className={cn(
                "px-4 py-2 font-pixel text-xs rounded-md transition-all",
                activeTab === 'upgrades'
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-blue-800/50"
              )}
            >
              TALENTS
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={cn(
                "px-4 py-2 font-pixel text-xs rounded-md transition-all",
                activeTab === 'catalog'
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-blue-800/50"
              )}
            >
              CATALOGUE
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Level & Progress */}
          {progress && (
            <div className="flex items-center gap-3 px-3 py-1 bg-blue-800/30 rounded-lg border border-blue-400/20">
              <div className="text-center">
                <div className="text-xs text-blue-400 font-pixel">NIVEAU</div>
                <div className="text-lg text-white font-pixel">{progress.level}</div>
              </div>
              <div className="w-px h-8 bg-blue-400/30" />
              <div className="text-center">
                <div className="text-xs text-cyan-400 font-pixel">XP</div>
                <div className="text-sm text-cyan-200 font-pixel">{progress.experience}</div>
              </div>
              <div className="w-px h-8 bg-blue-400/30" />
              <div className="text-center">
                <div className="text-xs text-blue-400 font-pixel">CAPTURES</div>
                <div className="text-sm text-blue-200 font-pixel">{progress.totalFishCaught}</div>
              </div>
            </div>
          )}

          <CoinDisplay size="md" />
          <AudioControls compact size="md" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {activeTab === 'game' && (
          <>
            {/* Game */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-blue-950/50 rounded-xl border-2 border-blue-900/50">
                  <div className="text-xl font-pixel text-blue-300 animate-pulse">
                    Chargement...
                  </div>
                </div>
              ) : !equippedRod ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-blue-950/50 rounded-xl border-2 border-blue-900/50 gap-4">
                  <div className="text-6xl">🎣</div>
                  <div className="text-xl font-pixel text-blue-300">
                    Pas de canne equipee!
                  </div>
                  <div className="text-sm font-pixel text-gray-400">
                    Achetez et equipez une canne dans l'onglet Equipement.
                  </div>
                  <button
                    onClick={() => setActiveTab('equipment')}
                    className="px-6 py-2 bg-gradient-to-b from-yellow-500 to-yellow-700 text-white font-pixel rounded-lg hover:from-yellow-400 hover:to-yellow-600 transition-all"
                  >
                    VOIR L'EQUIPEMENT
                  </button>
                </div>
              ) : (
                <FishingGame />
              )}
            </div>

            {/* Side Panel - Stats & Info */}
            <div className="w-72 flex flex-col gap-4 overflow-y-auto pixel-scrollbar">
              {/* Location Selector */}
              <div className="bg-blue-950/50 rounded-xl border-2 border-blue-900/50 p-4">
                <h3 className="font-pixel text-sm text-blue-300 mb-3">LIEU DE PECHE</h3>
                <LocationSelector />
              </div>

              {/* Current Equipment */}
              {equippedRod && (
                <div className="bg-blue-950/50 rounded-xl border-2 border-blue-900/50 p-4">
                  <h3 className="font-pixel text-sm text-blue-300 mb-3">EQUIPEMENT</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-2xl">🎣</span>
                      <div>
                        <div className="font-pixel text-cyan-300">{equippedRod.displayName}</div>
                        <div className="text-xs text-gray-400 font-pixel">
                          Tier {equippedRod.tier}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div className="text-center p-1 bg-blue-900/30 rounded">
                        <div className="text-gray-500">Zone</div>
                        <div className="text-green-400">+{equippedRod.reelZoneBonus}%</div>
                      </div>
                      <div className="text-center p-1 bg-blue-900/30 rounded">
                        <div className="text-gray-500">Capture</div>
                        <div className="text-blue-400">+{equippedRod.catchRateBonus}%</div>
                      </div>
                      <div className="text-center p-1 bg-blue-900/30 rounded">
                        <div className="text-gray-500">Rarete</div>
                        <div className="text-purple-400">+{equippedRod.rarityBonus}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              {progress && (
                <div className="bg-blue-950/50 rounded-xl border-2 border-blue-900/50 p-4">
                  <h3 className="font-pixel text-sm text-blue-300 mb-3">STATISTIQUES</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-pixel text-gray-400">Serie actuelle</span>
                      <span className="font-pixel text-white">{progress.currentStreak}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-pixel text-gray-400">Meilleure serie</span>
                      <span className="font-pixel text-yellow-400">{progress.bestStreak}</span>
                    </div>
                    {progress.largestFishSize && (
                      <div className="flex justify-between">
                        <span className="font-pixel text-gray-400">Plus gros poisson</span>
                        <span className="font-pixel text-cyan-400">{progress.largestFishSize} cm</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'equipment' && (
          <div className="flex-1 overflow-y-auto pixel-scrollbar">
            <EquipmentPanel />
          </div>
        )}

        {activeTab === 'upgrades' && (
          <div className="flex-1 overflow-y-auto pixel-scrollbar">
            <FishingUpgradesPanel />
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="flex-1 bg-blue-950/50 rounded-xl border-2 border-blue-900/50 p-4 overflow-hidden">
            <FishCatalog />
          </div>
        )}
      </div>
    </main>
  )
}
