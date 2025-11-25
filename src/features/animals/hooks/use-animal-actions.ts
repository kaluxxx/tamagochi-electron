import { useState, useEffect, useCallback, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAnimalActionsStore } from '../stores/animal-actions-store'

export type ActionType = 'feed' | 'play' | 'sleep' | 'heal'
export type ActiveAction = 'sleeping' | 'playing' | undefined

interface UseAnimalActionsProps {
  animalId: string
  isAlive: boolean
}

interface UseAnimalActionsReturn {
  actionInProgress: ActionType | null
  isSleeping: boolean
  sleepProgress: number
  isPlaying: boolean
  playProgress: number
  activeAction: ActiveAction
  handleAction: (action: ActionType) => void
  isActionDisabled: boolean
}

export function useAnimalActions({ animalId, isAlive }: UseAnimalActionsProps): UseAnimalActionsReturn {
  const queryClient = useQueryClient()
  const [instantActionInProgress, setInstantActionInProgress] = useState<'feed' | 'heal' | null>(null)
  // Compteur pour forcer le re-render toutes les secondes
  const [tick, setTick] = useState(0)

  const {
    isSleeping,
    isPlaying,
    activeActionType,
    getProgress,
    handleStartSleep,
    handleStartPlay,
    hasActiveAction,
  } = useAnimalActionsStore(animalId)

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

  // Mutations pour les actions instantanées
  const feedMutation = useMutation({
    mutationFn: () => window.api.animals.feed(animalId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['animals'] }),
    onSettled: () => setInstantActionInProgress(null),
  })

  const healMutation = useMutation({
    mutationFn: () => window.api.animals.heal(animalId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['animals'] }),
    onSettled: () => setInstantActionInProgress(null),
  })

  const handleAction = useCallback((action: ActionType) => {
    if (!isAlive || instantActionInProgress || hasActiveAction) return

    switch (action) {
      case 'feed':
        setInstantActionInProgress('feed')
        feedMutation.mutate()
        break
      case 'play':
        handleStartPlay()
        break
      case 'sleep':
        handleStartSleep()
        break
      case 'heal':
        setInstantActionInProgress('heal')
        healMutation.mutate()
        break
    }
  }, [isAlive, instantActionInProgress, hasActiveAction, feedMutation, healMutation, handleStartPlay, handleStartSleep])

  // Dériver actionInProgress depuis les états
  const actionInProgress = useMemo((): ActionType | null => {
    if (instantActionInProgress) return instantActionInProgress
    if (isSleeping) return 'sleep'
    if (isPlaying) return 'play'
    return null
  }, [instantActionInProgress, isSleeping, isPlaying])

  const activeAction: ActiveAction = activeActionType
  const isActionDisabled = !isAlive || !!actionInProgress || hasActiveAction

  return {
    actionInProgress,
    isSleeping,
    sleepProgress: isSleeping ? currentProgress : 0,
    isPlaying,
    playProgress: isPlaying ? currentProgress : 0,
    activeAction,
    handleAction,
    isActionDisabled,
  }
}
