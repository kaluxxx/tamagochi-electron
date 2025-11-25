import { getPrismaClient } from '@/electron/database/prisma'

// ============== ANIMAL TYPES ==============

export const getAllAnimalTypes = async () => {
  return getPrismaClient().animalType.findMany()
}

export const getAnimalTypeById = async (id: string) => {
  return getPrismaClient().animalType.findUnique({
    where: { id }
  })
}

// ============== ANIMAL CRUD ==============

export const getAllAnimals = async () => {
  return getPrismaClient().animal.findMany({
    include: { type: true },
    orderBy: { createdAt: 'desc' }
  })
}

export const getAnimalById = async (id: string) => {
  return getPrismaClient().animal.findUnique({
    where: { id },
    include: { type: true }
  })
}

export const createAnimal = async (data: { name: string; typeId: string }) => {
  return getPrismaClient().animal.create({
    data: {
      name: data.name,
      typeId: data.typeId
    },
    include: { type: true }
  })
}

// ============== TICK SYSTEM ==============

export interface TickResult {
  animal: {
    id: string
    name: string
    typeId: string
    hunger: number
    happiness: number
    health: number
    energy: number
    age: number
    createdAt: Date
    updatedAt: Date
    isAlive: boolean
    type: {
      id: string
      name: string
      displayName: string
      hungerDecayRate: number
      happinessDecayRate: number
      energyDecayRate: number
      healthDecayRate: number
      emoji: string
    }
  }
  justDied: boolean
  criticalStats: {
    hunger: boolean
    happiness: boolean
    energy: boolean
    health: boolean
  }
}

export const tickAnimal = async (id: string): Promise<TickResult> => {
  const animal = await getPrismaClient().animal.findUnique({
    where: { id },
    include: { type: true }
  })
  if (!animal) throw new Error('Animal not found')

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

  const updatedAnimal = await getPrismaClient().animal.update({
    where: { id },
    data: {
      hunger: newHunger,
      happiness: newHappiness,
      energy: newEnergy,
      health: newHealth,
      isAlive,
      age: animal.age + hoursElapsed,
      updatedAt: now
    },
    include: { type: true }
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
