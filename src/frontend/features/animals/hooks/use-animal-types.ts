import { useQuery } from '@tanstack/react-query'
import { animalApi } from '../services/animal-api'

/**
 * Hook pour récupérer tous les types d'animaux disponibles
 */
export function useAnimalTypes() {
  return useQuery({
    queryKey: ['animalTypes'],
    queryFn: animalApi.getAllAnimalTypes,
    staleTime: Infinity, // Les types d'animaux ne changent jamais
  })
}

/**
 * Hook pour récupérer un type d'animal par son ID
 */
export function useAnimalType(id: string) {
  return useQuery({
    queryKey: ['animalTypes', id],
    queryFn: () => animalApi.getAnimalTypeById(id),
    enabled: !!id,
    staleTime: Infinity,
  })
}
