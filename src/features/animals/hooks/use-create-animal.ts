import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { animalApi } from '../services/animal-api'
import type { CreateAnimalInput } from '../types'

/**
 * Hook pour créer un nouvel animal
 * Affiche un toast de succès et invalide le cache des animaux
 */
export function useCreateAnimal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAnimalInput) => animalApi.createAnimal(data),
    onSuccess: (animal) => {
      // Invalider le cache des animaux pour forcer un refetch
      queryClient.invalidateQueries({ queryKey: ['animals'] })

      // Afficher un toast de succès
      toast.success('Animal créé !', {
        description: `${animal.name} a été créé avec succès 🎉`,
      })
    },
    onError: (error) => {
      // Afficher un toast d'erreur
      toast.error('Erreur lors de la création', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}
