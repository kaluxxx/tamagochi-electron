import { create } from 'zustand'
import type {
  FishingGameState,
  FishSpecies,
  CatchFishResult,
} from '../types'

// QTE Configuration
export const QTE_CONFIG = {
  // Tension bar settings
  tensionMin: 0,
  tensionMax: 100,
  tensionDecayRate: 15, // Per second when not holding
  tensionIncreaseRate: 30, // Per second when holding
  tensionOptimalMin: 40, // Green zone start
  tensionOptimalMax: 70, // Green zone end
  tensionDangerThreshold: 90, // Line breaks above this

  // Timing settings
  baseReactionWindow: 1.5, // Seconds to react to bite
  baseCatchDuration: 5, // Seconds to catch fish
  difficultyMultiplier: 0.15, // How much difficulty affects duration

  // Progress bar settings
  progressPerTick: 2, // Progress gained when in green zone
  progressLossPerTick: 1, // Progress lost when outside green zone
  progressTarget: 100, // Target to catch fish
}

interface FishingGameStore {
  // Game State
  gameState: FishingGameState

  // Selected Equipment & Location
  selectedLocationId: string | null
  selectedBaitId: string | null
  equippedRodId: string | null

  // Current Fish (when bite occurs)
  currentFish: FishSpecies | null
  currentFishSize: number

  // QTE State
  tension: number
  isHolding: boolean
  catchProgress: number
  reactionTimeLeft: number
  catchTimeLeft: number

  // Result
  lastResult: CatchFishResult | null

  // Actions
  setGameState: (state: FishingGameState) => void
  setSelectedLocation: (locationId: string | null) => void
  setSelectedBait: (baitId: string | null) => void
  setEquippedRod: (rodId: string | null) => void

  // Game Flow Actions
  startCasting: () => void
  fishBite: (fish: FishSpecies, size: number) => void
  startCatching: () => void
  setHolding: (holding: boolean) => void
  updateTension: (delta: number) => void
  updateCatchProgress: (delta: number) => void
  updateReactionTime: (timeLeft: number) => void
  updateCatchTime: (timeLeft: number) => void

  // Result Actions
  catchSuccess: (result: CatchFishResult) => void
  catchFailure: () => void
  resetGame: () => void

  // Computed
  getTensionZone: () => 'safe' | 'optimal' | 'danger'
  getDifficultyAdjustedDuration: (difficulty: number) => number
}

export const useFishingStore = create<FishingGameStore>((set, get) => ({
  // Initial State
  gameState: 'idle',
  selectedLocationId: null,
  selectedBaitId: null,
  equippedRodId: null,
  currentFish: null,
  currentFishSize: 0,
  tension: 50,
  isHolding: false,
  catchProgress: 0,
  reactionTimeLeft: 0,
  catchTimeLeft: 0,
  lastResult: null,

  // Actions
  setGameState: (state) => set({ gameState: state }),
  setSelectedLocation: (locationId) => set({ selectedLocationId: locationId }),
  setSelectedBait: (baitId) => set({ selectedBaitId: baitId }),
  setEquippedRod: (rodId) => set({ equippedRodId: rodId }),

  // Game Flow
  startCasting: () => set({
    gameState: 'casting',
    currentFish: null,
    currentFishSize: 0,
    tension: 50,
    catchProgress: 0,
    lastResult: null,
  }),

  fishBite: (fish, size) => set({
    gameState: 'bite',
    currentFish: fish,
    currentFishSize: size,
    reactionTimeLeft: QTE_CONFIG.baseReactionWindow,
  }),

  startCatching: () => {
    const { currentFish } = get()
    const difficulty = currentFish?.difficulty ?? 1
    const catchDuration = get().getDifficultyAdjustedDuration(difficulty)

    set({
      gameState: 'catching',
      tension: 50,
      catchProgress: 0,
      isHolding: false,
      catchTimeLeft: catchDuration,
    })
  },

  setHolding: (holding) => set({ isHolding: holding }),

  updateTension: (delta) => set((state) => ({
    tension: Math.max(
      QTE_CONFIG.tensionMin,
      Math.min(QTE_CONFIG.tensionMax, state.tension + delta)
    ),
  })),

  updateCatchProgress: (delta) => set((state) => ({
    catchProgress: Math.max(0, Math.min(QTE_CONFIG.progressTarget, state.catchProgress + delta)),
  })),

  updateReactionTime: (timeLeft) => set({ reactionTimeLeft: timeLeft }),
  updateCatchTime: (timeLeft) => set({ catchTimeLeft: timeLeft }),

  catchSuccess: (result) => set({
    gameState: 'success',
    lastResult: result,
  }),

  catchFailure: () => set({
    gameState: 'failure',
    lastResult: null,
  }),

  resetGame: () => set({
    gameState: 'idle',
    currentFish: null,
    currentFishSize: 0,
    tension: 50,
    isHolding: false,
    catchProgress: 0,
    reactionTimeLeft: 0,
    catchTimeLeft: 0,
    lastResult: null,
  }),

  // Computed
  getTensionZone: () => {
    const { tension } = get()
    if (tension >= QTE_CONFIG.tensionDangerThreshold) return 'danger'
    if (tension >= QTE_CONFIG.tensionOptimalMin && tension <= QTE_CONFIG.tensionOptimalMax) return 'optimal'
    return 'safe'
  },

  getDifficultyAdjustedDuration: (difficulty) => {
    return QTE_CONFIG.baseCatchDuration + (difficulty * QTE_CONFIG.difficultyMultiplier)
  },
}))
