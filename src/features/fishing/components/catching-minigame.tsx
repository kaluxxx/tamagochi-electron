import { useEffect, useCallback, useRef, useState } from 'react'
import { useFishingStore, QTE_CONFIG } from '../stores/fishing.store'
import { cn } from '@/shared/lib/utils'

interface CatchingMinigameProps {
  difficulty: number
  reflexBonus: number
  onSuccess: () => void
  onFailure: () => void
}

export function CatchingMinigame({
  difficulty,
  reflexBonus,
  onSuccess,
  onFailure,
}: CatchingMinigameProps) {
  const tension = useFishingStore((s) => s.tension)
  const isHolding = useFishingStore((s) => s.isHolding)
  const catchProgress = useFishingStore((s) => s.catchProgress)
  const catchTimeLeft = useFishingStore((s) => s.catchTimeLeft)
  const setHolding = useFishingStore((s) => s.setHolding)
  const updateTension = useFishingStore((s) => s.updateTension)
  const updateCatchProgress = useFishingStore((s) => s.updateCatchProgress)
  const updateCatchTime = useFishingStore((s) => s.updateCatchTime)
  const getTensionZone = useFishingStore((s) => s.getTensionZone)

  const gameLoopRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const gameEndedRef = useRef(false)

  // State for visual struggling indicator (needed for render)
  const [isStruggling, setIsStruggling] = useState(false)

  // Refs to access current values in game loop without re-triggering effect
  const stateRef = useRef({ tension, isHolding, catchProgress, catchTimeLeft })

  // Update stateRef in useEffect to avoid lint error
  useEffect(() => {
    stateRef.current = { tension, isHolding, catchProgress, catchTimeLeft }
  })

  // Fish struggle simulation
  const fishStruggleRef = useRef<{
    nextStruggle: number
    isStruggling: boolean
    struggleDuration: number
  } | null>(null)

  // Initialize fishStruggleRef on mount
  useEffect(() => {
    if (!fishStruggleRef.current) {
      fishStruggleRef.current = {
        nextStruggle: Math.random() * 2 + 1,
        isStruggling: false,
        struggleDuration: 0,
      }
    }
  }, [])

  // Handle keyboard/mouse input
  const handlePointerDown = useCallback(() => {
    setHolding(true)
  }, [setHolding])

  const handlePointerUp = useCallback(() => {
    setHolding(false)
  }, [setHolding])

  // Game loop - only run once on mount
  useEffect(() => {
    gameEndedRef.current = false
    lastTimeRef.current = 0

    // Initialize fishStruggleRef if not already done
    if (!fishStruggleRef.current) {
      fishStruggleRef.current = {
        nextStruggle: Math.random() * 2 + 1,
        isStruggling: false,
        struggleDuration: 0,
      }
    }

    const gameLoop = (timestamp: number) => {
      if (gameEndedRef.current) return

      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp
      }

      const deltaTime = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      const { tension: currentTension, isHolding: currentHolding, catchProgress: currentProgress, catchTimeLeft: currentTimeLeft } = stateRef.current
      const fishStruggle = fishStruggleRef.current!

      // Update time remaining
      const newTimeLeft = currentTimeLeft - deltaTime
      updateCatchTime(Math.max(0, newTimeLeft))

      // Check for timeout
      if (newTimeLeft <= 0) {
        gameEndedRef.current = true
        onFailure()
        return
      }

      // Fish struggle logic
      fishStruggle.nextStruggle -= deltaTime
      if (fishStruggle.nextStruggle <= 0 && !fishStruggle.isStruggling) {
        fishStruggle.isStruggling = true
        fishStruggle.struggleDuration = 0.3 + Math.random() * 0.5
        setIsStruggling(true)
      }

      if (fishStruggle.isStruggling) {
        fishStruggle.struggleDuration -= deltaTime
        if (fishStruggle.struggleDuration <= 0) {
          fishStruggle.isStruggling = false
          fishStruggle.nextStruggle = 1 + Math.random() * (3 - difficulty * 0.3)
          setIsStruggling(false)
        }
      }

      // Calculate tension change
      let tensionChange = 0

      if (currentHolding) {
        tensionChange += QTE_CONFIG.tensionIncreaseRate * deltaTime
      } else {
        tensionChange -= QTE_CONFIG.tensionDecayRate * deltaTime
      }

      if (fishStruggle.isStruggling) {
        const struggleIntensity = 20 + (difficulty * 5)
        tensionChange += struggleIntensity * deltaTime
      }

      updateTension(tensionChange)

      // Check for line break
      if (currentTension + tensionChange >= QTE_CONFIG.tensionDangerThreshold) {
        gameEndedRef.current = true
        onFailure()
        return
      }

      // Update catch progress based on tension zone
      const zone = getTensionZone()
      let progressChange = 0

      if (zone === 'optimal') {
        const progressRate = QTE_CONFIG.progressPerTick * (1 + reflexBonus / 100)
        progressChange = progressRate * deltaTime * 10
      } else if (zone === 'safe') {
        progressChange = -QTE_CONFIG.progressLossPerTick * deltaTime * 5
      }

      updateCatchProgress(progressChange)

      // Check for catch success
      if (currentProgress + progressChange >= QTE_CONFIG.progressTarget) {
        gameEndedRef.current = true
        onSuccess()
        return
      }

      gameLoopRef.current = globalThis.requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = globalThis.requestAnimationFrame(gameLoop)

    return () => {
      gameEndedRef.current = true
      if (gameLoopRef.current) {
        globalThis.cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [difficulty, reflexBonus, onSuccess, onFailure, updateTension, updateCatchProgress, updateCatchTime, getTensionZone])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        setHolding(true)
      }
    }

    const handleKeyUp = (e: globalThis.KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setHolding(false)
      }
    }

    globalThis.addEventListener('keydown', handleKeyDown)
    globalThis.addEventListener('keyup', handleKeyUp)

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown)
      globalThis.removeEventListener('keyup', handleKeyUp)
    }
  }, [setHolding])

  const zone = getTensionZone()

  return (
    <div
      className="relative w-full h-full min-h-[300px] select-none cursor-pointer"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-blue-950/70 rounded-lg border-2 border-blue-400/30" />

      {/* Timer */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <div className="text-sm text-blue-300 font-pixel">TEMPS</div>
        <div className={cn(
          "text-2xl font-pixel",
          catchTimeLeft <= 3 ? "text-red-400 animate-pulse" : "text-white"
        )}>
          {catchTimeLeft.toFixed(1)}s
        </div>
      </div>

      {/* Tension Bar (Vertical) */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-48">
        {/* Bar background */}
        <div className="absolute inset-0 bg-gray-800 rounded-full border-2 border-gray-600 overflow-hidden">
          {/* Danger zone marker */}
          <div
            className="absolute left-0 right-0 bg-red-500/30"
            style={{
              top: 0,
              height: `${100 - QTE_CONFIG.tensionDangerThreshold}%`,
            }}
          />

          {/* Optimal zone (green) */}
          <div
            className="absolute left-0 right-0 bg-green-500/40"
            style={{
              bottom: `${QTE_CONFIG.tensionOptimalMin}%`,
              height: `${QTE_CONFIG.tensionOptimalMax - QTE_CONFIG.tensionOptimalMin}%`,
            }}
          />

          {/* Tension indicator */}
          <div
            className={cn(
              "absolute left-1 right-1 h-3 rounded-full transition-all duration-75",
              zone === 'optimal' && "bg-green-400 shadow-[0_0_10px_#4ade80]",
              zone === 'safe' && "bg-yellow-400",
              zone === 'danger' && "bg-red-500 animate-pulse shadow-[0_0_15px_#ef4444]",
            )}
            style={{
              bottom: `${tension}%`,
              transform: 'translateY(50%)',
            }}
          />
        </div>

        {/* Label */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-blue-300 font-pixel whitespace-nowrap">
          TENSION
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-48">
        {/* Bar background */}
        <div className="absolute inset-0 bg-gray-800 rounded-full border-2 border-gray-600 overflow-hidden">
          {/* Progress fill */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-300 transition-all duration-100"
            style={{ height: `${catchProgress}%` }}
          />

          {/* Target line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white" />
        </div>

        {/* Label */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-blue-300 font-pixel whitespace-nowrap">
          CAPTURE
        </div>
      </div>

      {/* Fish visual (center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className={cn(
            "text-6xl transition-transform duration-150",
            isStruggling && "animate-shake scale-110",
            isHolding && !isStruggling && "scale-95",
          )}
        >
          <span className={cn(
            "inline-block",
            isStruggling && "animate-wiggle"
          )}>
            🐟
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <div className={cn(
          "text-sm font-pixel px-4 py-2 rounded-lg",
          isHolding
            ? "bg-blue-500/50 text-blue-100"
            : "bg-gray-700/50 text-gray-300"
        )}>
          {isHolding ? "MAINTENIR..." : "CLIC / ESPACE"}
        </div>
      </div>

      {/* Struggle indicator */}
      {isStruggling && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-red-400 font-pixel text-sm animate-bounce">
          LE POISSON SE DEBAT!
        </div>
      )}
    </div>
  )
}
