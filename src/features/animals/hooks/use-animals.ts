import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { animalApi } from '../services/animal-api'
import type { Animal } from '../types'

/**
 * Hook pour écouter les événements de mise à jour des animaux depuis le main process
 */
function useAnimalEvents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Écouter les mises à jour du main process (tick system)
    const unsubscribeUpdated = window.api.onAnimalsUpdated(() => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    })

    // Écouter les morts d'animaux pour afficher un toast
    const unsubscribeDied = window.api.onAnimalDied((animal: Animal) => {
      toast.error(`${animal.name} est mort... 😢`, {
        duration: 5000,
      })
    })

    return () => {
      unsubscribeUpdated()
      unsubscribeDied()
    }
  }, [queryClient])
}

/**
 * Hook pour récupérer tous les animaux (vivants et morts)
 * Écoute automatiquement les événements du main process
 */
export function useAnimals() {
  // S'abonner aux événements IPC
  useAnimalEvents()

  return useQuery({
    queryKey: ['animals'],
    queryFn: animalApi.getAllAnimals,
    refetchInterval: 10000, // Backup refetch toutes les 10s
  })
}

/**
 * Hook pour récupérer un animal par son ID
 */
export function useAnimal(id: string) {
  return useQuery({
    queryKey: ['animals', id],
    queryFn: () => animalApi.getAnimalById(id),
    enabled: !!id,
    refetchInterval: 10000,
  })
}
