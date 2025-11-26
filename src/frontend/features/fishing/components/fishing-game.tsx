import { useEffect, useCallback, useRef } from 'react'
import { useFishingStore, QTE_CONFIG } from '../stores/fishing.store'
import {
  useEquippedRod,
  useFishingLocations,
  useFishingBaits,
  useFishingStats,
  useSelectRandomFish,
  useCatchFish,
  useFailCatch,
} from '../hooks/use-fishing'
import { CatchingMinigame } from './catching-minigame'
import { cn } from '@frontend/shared/lib/utils'

// Helper to get rarity color
function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'common':
      return 'text-gray-300'
    case 'uncommon':
      return 'text-green-400'
    case 'rare':
      return 'text-blue-400'
    case 'epic':
      return 'text-purple-400'
    case 'legendary':
      return 'text-yellow-400'
    default:
      return 'text-white'
  }
}

function getRarityBgColor(rarity: string) {
  switch (rarity) {
    case 'common':
      return 'bg-gray-600/50'
    case 'uncommon':
      return 'bg-green-600/50'
    case 'rare':
      return 'bg-blue-600/50'
    case 'epic':
      return 'bg-purple-600/50'
    case 'legendary':
      return 'bg-yellow-600/50 animate-pulse'
    default:
      return 'bg-gray-600/50'
  }
}

export function FishingGame() {
  const gameState = useFishingStore((s) => s.gameState)
  const selectedLocationId = useFishingStore((s) => s.selectedLocationId)
  const selectedBaitId = useFishingStore((s) => s.selectedBaitId)
  const currentFish = useFishingStore((s) => s.currentFish)
  const currentFishSize = useFishingStore((s) => s.currentFishSize)
  const reactionTimeLeft = useFishingStore((s) => s.reactionTimeLeft)
  const lastResult = useFishingStore((s) => s.lastResult)
  const setGameState = useFishingStore((s) => s.setGameState)
  const setSelectedLocation = useFishingStore((s) => s.setSelectedLocation)
  const setSelectedBait = useFishingStore((s) => s.setSelectedBait)
  const startCasting = useFishingStore((s) => s.startCasting)
  const startCatching = useFishingStore((s) => s.startCatching)
  const resetGame = useFishingStore((s) => s.resetGame)
  const updateReactionTime = useFishingStore((s) => s.updateReactionTime)
  const catchFailure = useFishingStore((s) => s.catchFailure)

  const { data: equippedRod } = useEquippedRod()
  const { data: locations } = useFishingLocations()
  const { data: baits } = useFishingBaits()
  const { data: stats } = useFishingStats()

  const selectRandomFish = useSelectRandomFish()
  const catchFish = useCatchFish()
  const failCatch = useFailCatch()

  // Store mutation refs to avoid dependency issues
  const failCatchRef = useRef(failCatch)
  const catchFishRef = useRef(catchFish)

  // Update refs in useEffect to avoid lint error
  useEffect(() => {
    failCatchRef.current = failCatch
    catchFishRef.current = catchFish
  })

  const reactionTimerRef = useRef<number | null>(null)
  const waitingTimerRef = useRef<number | null>(null)

  // Auto-select first unlocked location if none selected
  useEffect(() => {
    if (!selectedLocationId && locations) {
      const firstUnlocked = locations.find((l) => l.isUnlocked)
      if (firstUnlocked) {
        setSelectedLocation(firstUnlocked.id)
      }
    }
  }, [selectedLocationId, locations, setSelectedLocation])

  // Get current location and bait
  const currentLocation = locations?.find((l) => l.id === selectedLocationId)
  const currentBait = baits?.find((b) => b.id === selectedBaitId)
  const availableBaits = baits?.filter((b) => b.quantity > 0) ?? []

  // Handle casting
  const handleCast = useCallback(() => {
    if (!currentLocation || !equippedRod) return

    startCasting()

    // Simulate casting animation (1-2s)
    globalThis.setTimeout(() => {
      setGameState('waiting')

      // Random wait time before fish bites (2-6 seconds)
      const waitTime = 2000 + Math.random() * 4000

      waitingTimerRef.current = window.setTimeout(() => {
        // Select a random fish
        selectRandomFish.mutate({
          locationId: currentLocation.id,
          baitId: currentBait?.id,
        })
      }, waitTime)
    }, 1500)
  }, [currentLocation, equippedRod, currentBait, startCasting, setGameState, selectRandomFish])

  // Handle bite reaction timer
  useEffect(() => {
    if (gameState === 'bite' && currentFish) {
      const reactionTime = QTE_CONFIG.baseReactionWindow + (stats?.reflexBonus ?? 0) / 10
      updateReactionTime(reactionTime)

      const startTime = Date.now()
      const tickInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000
        const remaining = Math.max(0, reactionTime - elapsed)
        updateReactionTime(remaining)

        if (remaining <= 0) {
          clearInterval(tickInterval)
          // Player didn't react in time - use store action + mutation
          catchFailure()
          failCatchRef.current.mutate()
        }
      }, 50)

      reactionTimerRef.current = tickInterval as unknown as number

      return () => {
        clearInterval(tickInterval)
      }
    }
  }, [gameState, currentFish, stats?.reflexBonus, updateReactionTime, catchFailure])

  // Handle clicking during bite to start catching
  const handleBiteClick = useCallback(() => {
    if (gameState === 'bite' && currentFish) {
      if (reactionTimerRef.current) {
        clearInterval(reactionTimerRef.current)
      }
      startCatching()
    }
  }, [gameState, currentFish, startCatching])

  // Handle catch success
  const handleCatchSuccess = useCallback(() => {
    if (!currentFish || !currentLocation || !equippedRod) return

    catchFishRef.current.mutate({
      speciesId: currentFish.id,
      size: currentFishSize,
      locationId: currentLocation.id,
      rodId: equippedRod.id,
      baitId: currentBait?.id,
    })
  }, [currentFish, currentFishSize, currentLocation, equippedRod, currentBait])

  // Handle catch failure
  const handleCatchFailure = useCallback(() => {
    failCatchRef.current.mutate()
  }, [])

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    resetGame()
  }, [resetGame])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (waitingTimerRef.current) {
        globalThis.clearTimeout(waitingTimerRef.current)
      }
      if (reactionTimerRef.current) {
        globalThis.clearInterval(reactionTimerRef.current)
      }
    }
  }, [])

  // Render based on game state
  const renderGameContent = () => {
    switch (gameState) {
      case 'idle':
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
                  onClick={() => setSelectedBait(null)}
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
                    onClick={() => setSelectedBait(bait.id)}
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
              onClick={handleCast}
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

      case 'casting':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-6xl animate-swing origin-bottom">🎣</div>
            <div className="text-xl font-pixel text-blue-300 animate-pulse">
              LANCER EN COURS...
            </div>
          </div>
        )

      case 'waiting':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="relative">
              <div className="text-6xl">🎣</div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-gray-400 to-transparent" />
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 animate-bob">
                <span className="text-2xl">🪝</span>
              </div>
            </div>
            <div className="text-xl font-pixel text-blue-300 mt-8">
              EN ATTENTE D'UN POISSON...
            </div>
            <div className="flex gap-1">
              <span className="animate-pulse delay-0">.</span>
              <span className="animate-pulse delay-100">.</span>
              <span className="animate-pulse delay-200">.</span>
            </div>
          </div>
        )

      case 'bite':
        return (
          <div
            className="flex flex-col items-center justify-center h-full gap-4 cursor-pointer"
            onClick={handleBiteClick}
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
                  width: `${(reactionTimeLeft / (QTE_CONFIG.baseReactionWindow + (stats?.reflexBonus ?? 0) / 10)) * 100}%`,
                }}
              />
            </div>
            <div className="text-sm font-pixel text-gray-400">
              {reactionTimeLeft.toFixed(1)}s
            </div>
          </div>
        )

      case 'catching':
        return currentFish ? (
          <CatchingMinigame
            difficulty={currentFish.difficulty}
            reflexBonus={stats?.reflexBonus ?? 0}
            onSuccess={handleCatchSuccess}
            onFailure={handleCatchFailure}
          />
        ) : null

      case 'success':
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
              onClick={handlePlayAgain}
              className="px-8 py-3 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white rounded-xl font-pixel text-lg transition-all transform hover:scale-105 active:scale-95"
            >
              PECHER ENCORE
            </button>
          </div>
        )

      case 'failure':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-6xl">💨</div>
            <div className="text-2xl font-pixel text-red-400">
              LE POISSON S'EST ECHAPPE!
            </div>

            {currentFish && (
              <div className="text-center opacity-50">
                <div className="text-4xl">{currentFish.emoji}</div>
                <div className={cn("font-pixel", getRarityColor(currentFish.rarity))}>
                  {currentFish.displayName}
                </div>
              </div>
            )}

            <button
              onClick={handlePlayAgain}
              className="mt-4 px-8 py-3 bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white rounded-xl font-pixel text-lg transition-all transform hover:scale-105 active:scale-95"
            >
              REESSAYER
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-blue-950 to-slate-950 rounded-xl border-2 border-blue-900/50 p-4">
      {renderGameContent()}
    </div>
  )
}
