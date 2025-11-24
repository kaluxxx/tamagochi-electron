import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// AnimalType operations
export const getAllAnimalTypes = async () => {
  return prisma.animalType.findMany()
}

export const getAnimalTypeById = async (id: string) => {
  return prisma.animalType.findUnique({
    where: { id }
  })
}

// Animal operations
export const getAllAnimals = async () => {
  return prisma.animal.findMany({
    include: { type: true },
    orderBy: { createdAt: 'desc' }
  })
}

export const getAnimalById = async (id: string) => {
  return prisma.animal.findUnique({
    where: { id },
    include: { type: true }
  })
}

export const createAnimal = async (data: { name: string; typeId: string }) => {
  return prisma.animal.create({
    data: {
      name: data.name,
      typeId: data.typeId
    },
    include: { type: true }
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
  const animal = await prisma.animal.findUnique({
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

  // Health decreases only if hunger or happiness < 20
  const newHealth = (newHunger < 20 || newHappiness < 20)
    ? Math.max(0, animal.health - hoursElapsed * animal.type.healthDecayRate)
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
    },
    include: { type: true }
  })
}

// Action operations
export const getActionsByAnimalId = async (animalId: string) => {
  return prisma.action.findMany({
    where: { animalId },
    include: { item: true },
    orderBy: { timestamp: 'desc' },
    take: 20
  })
}

export const recordAction = async (animalId: string, actionType: string, itemId?: string) => {
  return prisma.action.create({
    data: {
      animalId,
      actionType,
      itemId
    },
    include: { item: true }
  })
}

// Item operations
export const getAllItems = async () => {
  return prisma.item.findMany()
}

export const getItemById = async (id: string) => {
  return prisma.item.findUnique({
    where: { id }
  })
}

export const getItemsByType = async (type: string) => {
  return prisma.item.findMany({
    where: { type }
  })
}

export const useItem = async (animalId: string, itemId: string) => {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } })
  const item = await prisma.item.findUnique({ where: { id: itemId } })

  if (!animal) throw new Error('Animal not found')
  if (!item) throw new Error('Item not found')
  if (animal.energy < item.energyCost) throw new Error('Not enough energy')

  // Apply item effects
  const updatedAnimal = await prisma.animal.update({
    where: { id: animalId },
    data: {
      hunger: Math.min(100, animal.hunger + item.hungerBoost),
      happiness: Math.min(100, animal.happiness + item.happinessBoost),
      health: Math.min(100, animal.health + item.healthBoost),
      energy: Math.max(0, animal.energy + item.energyBoost - item.energyCost),
      updatedAt: new Date()
    },
    include: { type: true }
  })

  // Record action
  await recordAction(animalId, 'use_item', itemId)

  return updatedAnimal
}
