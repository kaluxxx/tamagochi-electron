import type { Animal, AnimalType, CreateAnimalInput } from '../types'

/**
 * Service API pour les opérations liées aux animaux
 * Wrappers autour de window.api exposé par Electron IPC
 */

export const animalApi = {
  // AnimalTypes
  getAllAnimalTypes: async (): Promise<AnimalType[]> => {
    return window.api.animalTypes.getAll()
  },

  getAnimalTypeById: async (id: string): Promise<AnimalType | null> => {
    return window.api.animalTypes.getById(id)
  },

  // Animals
  getAllAnimals: async (): Promise<Animal[]> => {
    return window.api.animals.getAll()
  },

  getAnimalById: async (id: string): Promise<Animal | null> => {
    return window.api.animals.getById(id)
  },

  createAnimal: async (data: CreateAnimalInput): Promise<Animal> => {
    return window.api.animals.create(data)
  },

  feedAnimal: async (id: string): Promise<Animal> => {
    return window.api.animals.feed(id)
  },

  playWithAnimal: async (id: string): Promise<Animal> => {
    return window.api.animals.play(id)
  },

  healAnimal: async (id: string): Promise<Animal> => {
    return window.api.animals.heal(id)
  },

  sleepAnimal: async (id: string): Promise<Animal> => {
    return window.api.animals.sleep(id)
  },

  tickAnimal: async (id: string): Promise<Animal> => {
    return window.api.animals.tick(id)
  },
}
