import { useState, useEffect, useCallback, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CoinDisplay, useWallet, useClickerUpgrades, CLICKER_UPGRADE_CONFIG, economyApi } from '@/features/economy'
import type { ClickerUpgradeType } from '@/features/economy'
import { SpriteImage } from '@/shared/components/ui/sprite-image'
import { useSoundEffects } from '@/features/audio'
import { cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/minigames/clicker')({
  component: ClickerGame,
})

const BASE_GAME_DURATION = 10 // seconds
const COINS_PER_5_CLICKS = 1
const MAX_COINS = 50

type GameState = 'idle' | 'playing' | 'finished' | 'saved'

interface ClickPopup {
  id: number
  x: number
  y: number
}

function ClickerGame() {
  const navigate = useNavigate()
  const { refetch, coins } = useWallet()
  const { playSfx } = useSoundEffects()
  const {
    gameStats,
    isLoading: upgradesLoading,
    purchaseUpgrade,
    isPurchasing,
    getUpgradeLevel,
    getNextCost,
    getCurrentEffect,
  } = useClickerUpgrades()

  const [gameState, setGameState] = useState<GameState>('idle')
  const [clicks, setClicks] = useState(0)
  const [timeLeft, setTimeLeft] = useState(BASE_GAME_DURATION)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [clickPopups, setClickPopups] = useState<ClickPopup[]>([])
  const [purchaseFlash, setPurchaseFlash] = useState<ClickerUpgradeType | null>(null)

  const hasSavedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoClickerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const popupIdRef = useRef(0)

  // Get game stats with defaults
  const multiplier = gameStats?.multiplier ?? 1
  const gameDuration = gameStats?.gameDuration ?? BASE_GAME_DURATION
  const autoClicksPerSecond = gameStats?.autoClicksPerSecond ?? 0

  // Calculate coins from clicks with multiplier
  const calculateCoins = useCallback((clickCount: number) => {
    const baseCoins = Math.floor(clickCount / 5) * COINS_PER_5_CLICKS
    const multipliedCoins = Math.floor(baseCoins * multiplier)
    return Math.min(multipliedCoins, MAX_COINS)
  }, [multiplier])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (autoClickerRef.current) clearInterval(autoClickerRef.current)
    }
  }, [])

  // Save score when game finishes
  useEffect(() => {
    if (gameState !== 'finished' || hasSavedRef.current) return

    hasSavedRef.current = true

    const saveScore = async () => {
      const finalCoins = calculateCoins(clicks)
      setCoinsEarned(finalCoins)

      try {
        await economyApi.saveMinigameScore('clicker', clicks, finalCoins)
        await refetch()
      } catch (error) {
        console.error('Failed to save score:', error)
      }
      setGameState('saved')
    }

    void saveScore()
  }, [gameState, clicks, calculateCoins, refetch])

  const startGame = () => {
    hasSavedRef.current = false
    setClicks(0)
    setTimeLeft(gameDuration)
    setCoinsEarned(0)
    setClickPopups([])
    setGameState('playing')

    // Clear existing timers
    if (timerRef.current) clearInterval(timerRef.current)
    if (autoClickerRef.current) clearInterval(autoClickerRef.current)

    // Start countdown timer
    let remaining = gameDuration
    timerRef.current = setInterval(() => {
      remaining -= 1
      setTimeLeft(remaining)

      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        if (autoClickerRef.current) {
          clearInterval(autoClickerRef.current)
          autoClickerRef.current = null
        }
        setGameState('finished')
      }
    }, 1000)

    // Start auto-clicker if we have levels
    if (autoClicksPerSecond > 0) {
      autoClickerRef.current = setInterval(() => {
        setClicks((prev) => prev + autoClicksPerSecond)
      }, 1000)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (gameState === 'playing') {
      playSfx('click')
      setClicks((prev) => prev + 1)

      // Add click popup
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = popupIdRef.current++

      setClickPopups((prev) => [...prev, { id, x, y }])

      // Remove popup after animation
      window.setTimeout(() => {
        setClickPopups((prev) => prev.filter((p) => p.id !== id))
      }, 600)
    }
  }

  const handlePurchaseUpgrade = (type: ClickerUpgradeType) => {
    const cost = getNextCost(type)
    if (coins >= cost) {
      purchaseUpgrade(type, {
        onSuccess: () => {
          playSfx('upgrade_purchase')
          setPurchaseFlash(type)
          window.setTimeout(() => setPurchaseFlash(null), 300)
        },
      })
    }
  }

  const playAgain = () => {
    startGame()
  }

  if (upgradesLoading) {
    return (
      <main className="h-screen w-screen arcade-bg flex items-center justify-center">
        <div className="bg-[#FFF4E6] border-8 border-black p-8 pixel-panel">
          <p className="font-pixel text-black text-sm">CHARGEMENT...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen w-screen arcade-bg flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate({ to: '/minigames' })}
          className="px-3 py-1.5 bg-gray-200 border-2 border-black font-pixel text-[10px] uppercase hover:bg-gray-300 active:translate-y-0.5 transition-all"
        >
          RETOUR
        </button>
        <h1 className="font-pixel text-xl text-white drop-shadow-[2px_2px_0_#000]">
          CLICKER FRENZY
        </h1>
        <CoinDisplay size="md" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Game Zone */}
        <div className="flex-1 bg-[#1a1a2e]/80 border-4 border-black p-4 flex flex-col items-center justify-center relative">
          {gameState === 'idle' && (
            <div className="text-center">
              <SpriteImage
                src="/sprites/upgrades/coin.svg"
                alt="Coin"
                size="xl"
                pixelated
                className="mx-auto mb-4 w-20 h-20"
              />
              <h2 className="font-pixel text-lg text-white mb-2 drop-shadow-[2px_2px_0_#000]">
                CLICKER FRENZY
              </h2>
              <p className="font-pixel text-[10px] text-gray-300 mb-2">
                Clique le plus possible en {gameDuration} secondes !
              </p>
              <p className="font-pixel text-[10px] text-green-400 mb-2">
                1 piece pour 5 clics (x{multiplier.toFixed(1)} multi)
              </p>
              {autoClicksPerSecond > 0 && (
                <p className="font-pixel text-[10px] text-blue-400 mb-4">
                  Auto-clicker: {autoClicksPerSecond}/sec
                </p>
              )}
              <button
                onClick={startGame}
                className="arcade-btn text-lg"
              >
                JOUER !
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="text-center w-full">
              {/* Timer */}
              <div className="mb-4">
                <span
                  className={cn(
                    'font-pixel text-4xl',
                    timeLeft <= 5 ? 'animate-timer-urgent' : 'text-white'
                  )}
                >
                  {timeLeft}
                </span>
                <span className="font-pixel text-sm text-gray-400 ml-2">sec</span>
              </div>

              {/* Click count */}
              <div className="mb-2">
                <span className="font-pixel text-6xl text-white drop-shadow-[3px_3px_0_#000]">
                  {clicks}
                </span>
                <p className="font-pixel text-[10px] text-gray-400">CLICS</p>
              </div>

              {/* Potential coins */}
              <div className="mb-6 flex items-center justify-center gap-2">
                <SpriteImage
                  src="/sprites/upgrades/coin.svg"
                  alt="Coin"
                  size="sm"
                  pixelated
                  className="w-6 h-6"
                />
                <span className="font-pixel text-lg text-yellow-400">
                  {calculateCoins(clicks)}
                </span>
                {multiplier > 1 && (
                  <span className="font-pixel text-[10px] text-green-400">
                    (x{multiplier.toFixed(1)})
                  </span>
                )}
              </div>

              {/* Click target button */}
              <div className="relative inline-block">
                <button
                  onClick={handleClick}
                  className={cn(
                    'arcade-btn text-2xl select-none',
                    autoClicksPerSecond > 0 && 'animate-auto-pulse'
                  )}
                >
                  CLIC !
                </button>

                {/* Click popups */}
                {clickPopups.map((popup) => (
                  <span
                    key={popup.id}
                    className="absolute font-pixel text-yellow-400 text-sm pointer-events-none animate-click-pop"
                    style={{ left: popup.x, top: popup.y }}
                  >
                    +1
                  </span>
                ))}
              </div>

              {/* Auto-clicker indicator */}
              {autoClicksPerSecond > 0 && (
                <p className="mt-4 font-pixel text-[10px] text-green-400">
                  AUTO: +{autoClicksPerSecond}/sec
                </p>
              )}
            </div>
          )}

          {(gameState === 'finished' || gameState === 'saved') && (
            <div className="text-center">
              <div className="text-6xl mb-4">
                <SpriteImage
                  src="/sprites/upgrades/coin.svg"
                  alt="Coin"
                  size="xl"
                  pixelated
                  className="mx-auto w-20 h-20 animate-coin-spin"
                />
              </div>
              <h2 className="font-pixel text-lg text-white mb-2 drop-shadow-[2px_2px_0_#000]">
                TERMINE !
              </h2>

              <div className="bg-[#FFF4E6] border-4 border-black p-4 mb-4">
                <p className="font-pixel text-sm text-gray-600 mb-2">
                  Clics: <span className="text-black">{clicks}</span>
                </p>
                <div className="flex items-center justify-center gap-2">
                  <SpriteImage
                    src="/sprites/upgrades/coin.svg"
                    alt="Coin"
                    size="sm"
                    pixelated
                    className="w-6 h-6"
                  />
                  <span className="font-pixel text-lg text-yellow-600">
                    +{coinsEarned} pieces
                  </span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={playAgain}
                  className="px-4 py-2 bg-[#98D8AA] border-4 border-black font-pixel text-[10px] uppercase hover:bg-[#7BC77E] active:translate-y-1 transition-all"
                >
                  REJOUER
                </button>
                <button
                  onClick={() => navigate({ to: '/minigames' })}
                  className="px-4 py-2 bg-gray-200 border-4 border-black font-pixel text-[10px] uppercase hover:bg-gray-300 active:translate-y-1 transition-all"
                >
                  MENU
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upgrades Panel */}
        <div className="w-72 bg-[#FFF4E6] border-4 border-black p-4 overflow-y-auto pixel-scrollbar">
          <h2 className="font-pixel text-sm text-black text-center mb-4 border-b-2 border-black pb-2">
            UPGRADES
          </h2>

          <div className="space-y-3">
            {(['multiplier', 'time_bonus', 'auto_clicker'] as ClickerUpgradeType[]).map((type) => {
              const config = CLICKER_UPGRADE_CONFIG[type]
              const level = getUpgradeLevel(type)
              const cost = getNextCost(type)
              const effect = getCurrentEffect(type)
              const canAfford = coins >= cost

              return (
                <button
                  key={type}
                  onClick={() => handlePurchaseUpgrade(type)}
                  disabled={!canAfford || isPurchasing || gameState === 'playing'}
                  className={cn(
                    'upgrade-card w-full text-left',
                    canAfford && gameState !== 'playing' && 'can-afford',
                    purchaseFlash === type && 'animate-upgrade-flash'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <SpriteImage
                      src={config.icon}
                      alt={config.displayName}
                      size="md"
                      pixelated
                      className="w-10 h-10 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-[10px] text-black uppercase">
                          {config.displayName}
                        </span>
                        <span className="font-pixel text-[8px] text-gray-500">
                          Niv.{level}
                        </span>
                      </div>
                      <p className="font-pixel text-[8px] text-gray-600 mt-1">
                        {config.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-pixel text-[8px] text-blue-600">
                          {type === 'multiplier' && `x${effect.toFixed(1)}`}
                          {type === 'time_bonus' && `${effect}s`}
                          {type === 'auto_clicker' && `${effect}/sec`}
                        </span>
                        <div className="flex items-center gap-1">
                          <SpriteImage
                            src="/sprites/upgrades/coin.svg"
                            alt="Coin"
                            size="xs"
                            pixelated
                            className="w-4 h-4"
                          />
                          <span
                            className={cn(
                              'font-pixel text-[10px]',
                              canAfford ? 'text-green-600' : 'text-red-600'
                            )}
                          >
                            {cost}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Current stats summary */}
          <div className="mt-4 pt-4 border-t-2 border-black">
            <h3 className="font-pixel text-[10px] text-black mb-2">STATS ACTUELLES</h3>
            <div className="space-y-1 text-[8px] font-pixel text-gray-600">
              <p>Multiplicateur: x{multiplier.toFixed(1)}</p>
              <p>Duree: {gameDuration}s</p>
              <p>Auto-clic: {autoClicksPerSecond}/sec</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
