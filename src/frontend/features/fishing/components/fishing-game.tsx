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
import {
  IdleState,
  CastingState,
  WaitingState,
  BiteState,
  SuccessState,
  FailureState,
} from './game-states'

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
          <IdleState
            currentLocation={currentLocation ?? undefined}
            equippedRod={equippedRod ?? undefined}
            currentBait={currentBait ?? undefined}
            availableBaits={availableBaits}
            selectedBaitId={selectedBaitId}
            onCast={handleCast}
            onSelectBait={setSelectedBait}
          />
        )

      case 'casting':
        return <CastingState />

      case 'waiting':
        return <WaitingState />

      case 'bite':
        return (
          <BiteState
            reactionTimeLeft={reactionTimeLeft}
            reflexBonus={stats?.reflexBonus ?? 0}
            onClick={handleBiteClick}
          />
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
          <SuccessState
            lastResult={lastResult}
            onPlayAgain={handlePlayAgain}
          />
        )

      case 'failure':
        return (
          <FailureState
            currentFish={currentFish}
            onPlayAgain={handlePlayAgain}
          />
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
