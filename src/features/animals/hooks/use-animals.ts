import { useQuery } from '@tanstack/react-query'
import { animalApi } from '../services/animal-api'

/**
 * Hook pour récupérer tous les animaux (vivants et morts)
 */
export function useAnimals() {
  return useQuery({
    queryKey: ['animals'],
    queryFn: animalApi.getAllAnimals,
    refetchInterval: 10000, // Refetch toutes les 10s pour synchroniser avec le tick system
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
