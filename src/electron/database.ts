import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Animal operations
export const getAllAnimals = async () => {
  return prisma.animal.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export const getAnimalById = async (id: string) => {
  return prisma.animal.findUnique({
    where: { id }
  })
}

export const createAnimal = async (data: { name: string; type: string }) => {
  return prisma.animal.create({
    data: {
      name: data.name,
      type: data.type
    }
  })
}

export const feedAnimal = async (id: string) => {
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')

  return prisma.animal.update({
    where: { id },
    data: {
      hunger: Math.min(100, animal.hunger + 20),
      happiness: Math.min(100, animal.happiness + 5),
      energy: Math.max(0, animal.energy - 5),
      updatedAt: new Date()
    }
  })
}

export const playWithAnimal = async (id: string) => {
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')
  if (animal.energy < 10) throw new Error('Not enough energy')

  return prisma.animal.update({
    where: { id },
    data: {
      happiness: Math.min(100, animal.happiness + 15),
      energy: Math.max(0, animal.energy - 10),
      hunger: Math.max(0, animal.hunger - 5),
      updatedAt: new Date()
    }
  })
}

export const healAnimal = async (id: string) => {
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')

  return prisma.animal.update({
    where: { id },
    data: {
      health: Math.min(100, animal.health + 20),
      updatedAt: new Date()
    }
  })
}

export const sleepAnimal = async (id: string) => {
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')

  return prisma.animal.update({
    where: { id },
    data: {
      energy: Math.min(100, animal.energy + 30),
      happiness: Math.min(100, animal.happiness + 5),
      updatedAt: new Date()
    }
  })
}

export const tickAnimal = async (id: string) => {
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')

  // Calculate elapsed time
  const now = new Date()
  const lastUpdate = animal.updatedAt
  const hoursElapsed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

  // Stat degradation
  const newHunger = Math.max(0, animal.hunger - hoursElapsed * 2)
  const newHappiness = Math.max(0, animal.happiness - hoursElapsed * 1.5)
  const newEnergy = Math.max(0, animal.energy - hoursElapsed * 1)

  // Health decreases only if hunger or happiness < 20
  const newHealth = (newHunger < 20 || newHappiness < 20)
    ? Math.max(0, animal.health - hoursElapsed * 3)
    : animal.health

  // Death if health = 0
  const isAlive = newHealth > 0

  return prisma.animal.update({
    where: { id },
    data: {
      hunger: newHunger,
      happiness: newHappiness,
      energy: newEnergy,
      health: newHealth,
      isAlive,
      age: animal.age + hoursElapsed,
      updatedAt: now
    }
  })
}

// Action operations
export const getActionsByAnimalId = async (animalId: string) => {
  return prisma.action.findMany({
    where: { animalId },
    orderBy: { timestamp: 'desc' },
    take: 20
  })
}

export const recordAction = async (animalId: string, actionType: string) => {
  return prisma.action.create({
    data: {
      animalId,
      actionType
    }
  })
}
