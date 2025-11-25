// Export des types depuis window.d.ts pour utilisation dans la feature animals
export type { Animal, AnimalType, CreateAnimalInput } from '@/shared/types/window'

// DTO pour la création d'animal
export interface CreateAnimalDto {
  name: string
  typeId: string
}
