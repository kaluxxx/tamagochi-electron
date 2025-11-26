import { animalRepository, type AnimalWithType, type AnimalCreateInput } from '../repositories'
import { NotFoundError, AnimalDeadError } from '../../../core/errors'

export interface TickResult {
  animal: AnimalWithType
  justDied: boolean
  criticalStats: {
    hunger: boolean
    happiness: boolean
    energy: boolean
    health: boolean
  }
}

export class AnimalController {
  private static instance: AnimalController

  private constructor() {}

  static getInstance(): AnimalController {
    if (!AnimalController.instance) {
      AnimalController.instance = new AnimalController()
    }
    return AnimalController.instance
  }

  async getAllAnimals(): Promise<AnimalWithType[]> {
    return animalRepository.findAll()
  }

  async getAnimalById(id: string): Promise<AnimalWithType> {
    const animal = await animalRepository.findById(id)
    if (!animal) {
      throw new NotFoundError('Animal', id)
    }
    return animal
  }

  async getAliveAnimals(): Promise<AnimalWithType[]> {
    return animalRepository.findAlive()
  }

  async createAnimal(data: AnimalCreateInput): Promise<AnimalWithType> {
    return animalRepository.create(data)
  }

  async tickAnimal(id: string): Promise<TickResult> {
    const animal = await animalRepository.findById(id)
    if (!animal) {
      throw new NotFoundError('Animal', id)
    }

    // Calculate elapsed time
    const now = new Date()
    const lastUpdate = animal.updatedAt
    const hoursElapsed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

    // Stat degradation using type-specific rates
    const newHunger = Math.max(0, animal.hunger - hoursElapsed * animal.type.hungerDecayRate)
    const newHappiness = Math.max(0, animal.happiness - hoursElapsed * animal.type.happinessDecayRate)
    const newEnergy = Math.max(0, animal.energy - hoursElapsed * animal.type.energyDecayRate)

    // Count critical stats (< 20) for health degradation multiplier
    const criticalStatsCount = [
      newHunger < 20,
      newHappiness < 20,
      newEnergy < 20
    ].filter(Boolean).length

    // Health decreases when any stat < 20, multiplied by number of critical stats
    const newHealth = criticalStatsCount > 0
      ? Math.max(0, animal.health - hoursElapsed * animal.type.healthDecayRate * criticalStatsCount)
      : animal.health

    // Death if health = 0
    const isAlive = newHealth > 0
    const wasAlive = animal.isAlive

    const updatedAnimal = await animalRepository.update(id, {
      hunger: newHunger,
      happiness: newHappiness,
      energy: newEnergy,
      health: newHealth,
      isAlive,
      age: animal.age + hoursElapsed,
      updatedAt: now
    })

    return {
      animal: updatedAnimal,
      justDied: wasAlive && !isAlive,
      criticalStats: {
        hunger: newHunger < 30,
        happiness: newHappiness < 30,
        energy: newEnergy < 30,
        health: newHealth < 30
      }
    }
  }

  /**
   * Validates that an animal exists and is alive before performing actions
   */
  async validateAliveAnimal(id: string): Promise<AnimalWithType> {
    const animal = await animalRepository.findById(id)
    if (!animal) {
      throw new NotFoundError('Animal', id)
    }
    if (!animal.isAlive) {
      throw new AnimalDeadError(id)
    }
    return animal
  }
}

export const animalController = AnimalController.getInstance()
