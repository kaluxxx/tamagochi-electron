import { create } from 'zustand'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { ActiveActionType } from '../types'

const SLEEP_DURATION_MS = 30000 // 30 secondes
const PLAY_DURATION_MS = 20000  // 20 secondes
const FEED_DURATION_MS = 5000   // 5 secondes
const HEAL_DURATION_MS = 8000   // 8 secondes
const USE_ITEM_DURATION_MS = 3000 // 3 secondes

interface ActiveAction {
  type: ActiveActionType
  startTime: number
  duration: number
}

interface ActionsState {
  activeActions: Record<string, ActiveAction>
  startAction: (animalId: string, action: ActiveAction) => void
  endAction: (animalId: string) => void
  getProgress: (animalId: string) => number
}

// Timers pour chaque animal (hors du store pour éviter la sérialisation)
const actionTimeouts: Map<string, ReturnType<typeof globalThis.setTimeout>> = new Map()

export const useActionsStoreBase = create<ActionsState>((set, get) => ({
  activeActions: {},

  startAction: (animalId, action) => {
    set((state) => ({
      activeActions: {
        ...state.activeActions,
        [animalId]: action,
      },
    }))
  },

  endAction: (animalId) => {
    set((state) => {
      const { [animalId]: _removed, ...rest } = state.activeActions
      void _removed
      return { activeActions: rest }
    })
  },

  getProgress: (animalId) => {
    const action = get().activeActions[animalId]
    if (!action) return 0

    const elapsed = Date.now() - action.startTime
    return Math.min((elapsed / action.duration) * 100, 100)
  },
}))

// Hook pour utiliser le store avec les actions
export function useActionsStore(animalId: string) {
  const queryClient = useQueryClient()
  const { activeActions, startAction, endAction, getProgress } = useActionsStoreBase()

  const activeAction = activeActions[animalId]
  const isSleeping = activeAction?.type === 'sleeping'
  const isPlaying = activeAction?.type === 'playing'
  const isFeeding = activeAction?.type === 'feeding'
  const isHealing = activeAction?.type === 'healing'
  const isUsingItem = activeAction?.type === 'using_item'

  const handleStartSleep = useCallback(() => {
    // Nettoyer le timer existant si présent
    const existingTimeout = actionTimeouts.get(animalId)
    if (existingTimeout) {
      globalThis.clearTimeout(existingTimeout)
    }

    // Démarrer l'action
    startAction(animalId, {
      type: 'sleeping',
      startTime: Date.now(),
      duration: SLEEP_DURATION_MS,
    })

    // Programmer la fin
    const timeout = globalThis.setTimeout(async () => {
      try {
        await window.api.animals.sleep(animalId)
        await queryClient.invalidateQueries({ queryKey: ['animals'] })
        await queryClient.invalidateQueries({ queryKey: ['history', animalId] })
      } finally {
        endAction(animalId)
        actionTimeouts.delete(animalId)
      }
    }, SLEEP_DURATION_MS)

    actionTimeouts.set(animalId, timeout)
  }, [animalId, queryClient, startAction, endAction])

  const handleStartPlay = useCallback(() => {
    // Nettoyer le timer existant si présent
    const existingTimeout = actionTimeouts.get(animalId)
    if (existingTimeout) {
      globalThis.clearTimeout(existingTimeout)
    }

    // Démarrer l'action
    startAction(animalId, {
      type: 'playing',
      startTime: Date.now(),
      duration: PLAY_DURATION_MS,
    })

    // Programmer la fin
    const timeout = globalThis.setTimeout(async () => {
      try {
        await window.api.animals.play(animalId)
        await queryClient.invalidateQueries({ queryKey: ['animals'] })
        await queryClient.invalidateQueries({ queryKey: ['history', animalId] })
      } finally {
        endAction(animalId)
        actionTimeouts.delete(animalId)
      }
    }, PLAY_DURATION_MS)

    actionTimeouts.set(animalId, timeout)
  }, [animalId, queryClient, startAction, endAction])

  const handleStartFeed = useCallback(() => {
    // Nettoyer le timer existant si présent
    const existingTimeout = actionTimeouts.get(animalId)
    if (existingTimeout) {
      globalThis.clearTimeout(existingTimeout)
    }

    // Démarrer l'action
    startAction(animalId, {
      type: 'feeding',
      startTime: Date.now(),
      duration: FEED_DURATION_MS,
    })

    // Programmer la fin
    const timeout = globalThis.setTimeout(async () => {
      try {
        await window.api.animals.feed(animalId)
        await queryClient.invalidateQueries({ queryKey: ['animals'] })
        await queryClient.invalidateQueries({ queryKey: ['history', animalId] })
      } finally {
        endAction(animalId)
        actionTimeouts.delete(animalId)
      }
    }, FEED_DURATION_MS)

    actionTimeouts.set(animalId, timeout)
  }, [animalId, queryClient, startAction, endAction])

  const handleStartHeal = useCallback(() => {
    // Nettoyer le timer existant si présent
    const existingTimeout = actionTimeouts.get(animalId)
    if (existingTimeout) {
      globalThis.clearTimeout(existingTimeout)
    }

    // Démarrer l'action
    startAction(animalId, {
      type: 'healing',
      startTime: Date.now(),
      duration: HEAL_DURATION_MS,
    })

    // Programmer la fin
    const timeout = globalThis.setTimeout(async () => {
      try {
        await window.api.animals.heal(animalId)
        await queryClient.invalidateQueries({ queryKey: ['animals'] })
        await queryClient.invalidateQueries({ queryKey: ['history', animalId] })
      } finally {
        endAction(animalId)
        actionTimeouts.delete(animalId)
      }
    }, HEAL_DURATION_MS)

    actionTimeouts.set(animalId, timeout)
  }, [animalId, queryClient, startAction, endAction])

  const handleStartUseItem = useCallback((itemId: string, onComplete: () => void) => {
    // Nettoyer le timer existant si présent
    const existingTimeout = actionTimeouts.get(animalId)
    if (existingTimeout) {
      globalThis.clearTimeout(existingTimeout)
    }

    // Démarrer l'action
    startAction(animalId, {
      type: 'using_item',
      startTime: Date.now(),
      duration: USE_ITEM_DURATION_MS,
    })

    // Programmer la fin
    const timeout = globalThis.setTimeout(async () => {
      try {
        await window.api.items.useItem(animalId, itemId)
        await queryClient.invalidateQueries({ queryKey: ['animals'] })
        await queryClient.invalidateQueries({ queryKey: ['history', animalId] })
        await queryClient.invalidateQueries({ queryKey: ['inventory'] })
        onComplete()
      } finally {
        endAction(animalId)
        actionTimeouts.delete(animalId)
      }
    }, USE_ITEM_DURATION_MS)

    actionTimeouts.set(animalId, timeout)
  }, [animalId, queryClient, startAction, endAction])

  const getProgressForAnimal = useCallback(() => {
    return getProgress(animalId)
  }, [animalId, getProgress])

  return {
    isSleeping,
    isPlaying,
    isFeeding,
    isHealing,
    isUsingItem,
    activeActionType: activeAction?.type,
    getProgress: getProgressForAnimal,
    handleStartSleep,
    handleStartPlay,
    handleStartFeed,
    handleStartHeal,
    handleStartUseItem,
    hasActiveAction: !!activeAction,
  }
}
