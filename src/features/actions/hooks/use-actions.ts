import { useEffect, useCallback, useMemo } from 'react'
import { useState } from 'react'
import { useActionsStore } from '../stores/actions-store'
import type { ActionType, ActiveAction } from '../types'

interface UseActionsProps {
  animalId: string
  isAlive: boolean
}

interface UseActionsReturn {
  actionInProgress: ActionType | null
  isSleeping: boolean
  sleepProgress: number
  isPlaying: boolean
  playProgress: number
  isFeeding: boolean
  feedProgress: number
  isHealing: boolean
  healProgress: number
  isUsingItem: boolean
  useItemProgress: number
  activeAction: ActiveAction
  handleAction: (action: ActionType) => void
  handleUseItem: (itemId: string, onComplete: () => void) => void
  isActionDisabled: boolean
}

export function useActions({ animalId, isAlive }: UseActionsProps): UseActionsReturn {
  // Compteur pour forcer le re-render toutes les secondes
  const [tick, setTick] = useState(0)

  const {
    isSleeping,
    isPlaying,
    isFeeding,
    isHealing,
    isUsingItem,
    activeActionType,
    getProgress,
    handleStartSleep,
    handleStartPlay,
    handleStartFeed,
    handleStartHeal,
    handleStartUseItem,
    hasActiveAction,
  } = useActionsStore(animalId)

  // Forcer le re-render toutes les secondes pour mettre à jour la progression
  useEffect(() => {
    if (!hasActiveAction) {
      return
    }

    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [hasActiveAction, animalId])

  // Calculer la progression à chaque render (tick force le recalcul)
  const currentProgress = useMemo(() => {
    // tick est utilisé pour forcer le recalcul
    void tick
    return hasActiveAction ? getProgress() : 0
  }, [hasActiveAction, getProgress, tick])

  const handleAction = useCallback((action: ActionType) => {
    if (!isAlive || hasActiveAction) return

    switch (action) {
      case 'feed':
        handleStartFeed()
        break
      case 'play':
        handleStartPlay()
        break
      case 'sleep':
        handleStartSleep()
        break
      case 'heal':
        handleStartHeal()
        break
    }
  }, [isAlive, hasActiveAction, handleStartFeed, handleStartPlay, handleStartSleep, handleStartHeal])

  // Dériver actionInProgress depuis les états
  const actionInProgress = useMemo((): ActionType | null => {
    if (isFeeding) return 'feed'
    if (isHealing) return 'heal'
    if (isSleeping) return 'sleep'
    if (isPlaying) return 'play'
    return null
  }, [isFeeding, isHealing, isSleeping, isPlaying])

  const handleUseItem = useCallback((itemId: string, onComplete: () => void) => {
    if (!isAlive || hasActiveAction) return
    handleStartUseItem(itemId, onComplete)
  }, [isAlive, hasActiveAction, handleStartUseItem])

  const activeAction: ActiveAction = activeActionType
  const isActionDisabled = !isAlive || hasActiveAction

  return {
    actionInProgress,
    isSleeping,
    sleepProgress: isSleeping ? currentProgress : 0,
    isPlaying,
    playProgress: isPlaying ? currentProgress : 0,
    isFeeding,
    feedProgress: isFeeding ? currentProgress : 0,
    isHealing,
    healProgress: isHealing ? currentProgress : 0,
    isUsingItem,
    useItemProgress: isUsingItem ? currentProgress : 0,
    activeAction,
    handleAction,
    handleUseItem,
    isActionDisabled,
  }
}
