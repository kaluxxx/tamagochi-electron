import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error', 'warn']
    })
  }
  return prisma
}

export async function initializeDatabase() {
  try {
    const client = getPrismaClient()
    await client.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Failed to connect to database:', error)
    throw error
  }
}

export async function closeDatabase() {
  if (prisma) {
    await prisma.$disconnect()
    console.log('Database disconnected')
  }
}

// AnimalType operations
export const getAllAnimalTypes = async () => {
  return getPrismaClient().animalType.findMany()
}

export const getAnimalTypeById = async (id: string) => {
  return getPrismaClient().animalType.findUnique({
    where: { id }
  })
}

// Animal operations
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

export const feedAnimal = async (id: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')

  // Capture stats before
  const statsBefore = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: animal.health,
    energy: animal.energy
  }

  // Calculate new stats
  const statsAfter = {
    hunger: Math.min(100, animal.hunger + 20),
    happiness: Math.min(100, animal.happiness + 5),
    health: animal.health,
    energy: Math.max(0, animal.energy - 5)
  }

  // Transaction: update animal and record action
  const [updatedAnimal] = await prisma.$transaction([
    prisma.animal.update({
      where: { id },
      data: {
        hunger: statsAfter.hunger,
        happiness: statsAfter.happiness,
        energy: statsAfter.energy,
        updatedAt: new Date()
      },
      include: { type: true }
    }),
    prisma.action.create({
      data: {
        animalId: id,
        actionType: 'feed',
        hungerBefore: statsBefore.hunger,
        happinessBefore: statsBefore.happiness,
        healthBefore: statsBefore.health,
        energyBefore: statsBefore.energy,
        hungerAfter: statsAfter.hunger,
        happinessAfter: statsAfter.happiness,
        healthAfter: statsAfter.health,
        energyAfter: statsAfter.energy
      }
    })
  ])

  return updatedAnimal
}

export const playWithAnimal = async (id: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')
  if (animal.energy < 10) throw new Error('Not enough energy')

  // Capture stats before
  const statsBefore = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: animal.health,
    energy: animal.energy
  }

  // Calculate new stats
  const statsAfter = {
    hunger: Math.max(0, animal.hunger - 5),
    happiness: Math.min(100, animal.happiness + 15),
    health: animal.health,
    energy: Math.max(0, animal.energy - 10)
  }

  // Transaction: update animal and record action
  const [updatedAnimal] = await prisma.$transaction([
    prisma.animal.update({
      where: { id },
      data: {
        happiness: statsAfter.happiness,
        energy: statsAfter.energy,
        hunger: statsAfter.hunger,
        updatedAt: new Date()
      },
      include: { type: true }
    }),
    prisma.action.create({
      data: {
        animalId: id,
        actionType: 'play',
        hungerBefore: statsBefore.hunger,
        happinessBefore: statsBefore.happiness,
        healthBefore: statsBefore.health,
        energyBefore: statsBefore.energy,
        hungerAfter: statsAfter.hunger,
        happinessAfter: statsAfter.happiness,
        healthAfter: statsAfter.health,
        energyAfter: statsAfter.energy
      }
    })
  ])

  return updatedAnimal
}

export const healAnimal = async (id: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')

  // Capture stats before
  const statsBefore = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: animal.health,
    energy: animal.energy
  }

  // Calculate new stats
  const statsAfter = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: Math.min(100, animal.health + 20),
    energy: animal.energy
  }

  // Transaction: update animal and record action
  const [updatedAnimal] = await prisma.$transaction([
    prisma.animal.update({
      where: { id },
      data: {
        health: statsAfter.health,
        updatedAt: new Date()
      },
      include: { type: true }
    }),
    prisma.action.create({
      data: {
        animalId: id,
        actionType: 'heal',
        hungerBefore: statsBefore.hunger,
        happinessBefore: statsBefore.happiness,
        healthBefore: statsBefore.health,
        energyBefore: statsBefore.energy,
        hungerAfter: statsAfter.hunger,
        happinessAfter: statsAfter.happiness,
        healthAfter: statsAfter.health,
        energyAfter: statsAfter.energy
      }
    })
  ])

  return updatedAnimal
}

export const sleepAnimal = async (id: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')

  // Capture stats before
  const statsBefore = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: animal.health,
    energy: animal.energy
  }

  // Calculate new stats
  const statsAfter = {
    hunger: animal.hunger,
    happiness: Math.min(100, animal.happiness + 5),
    health: animal.health,
    energy: Math.min(100, animal.energy + 30)
  }

  // Transaction: update animal and record action
  const [updatedAnimal] = await prisma.$transaction([
    prisma.animal.update({
      where: { id },
      data: {
        energy: statsAfter.energy,
        happiness: statsAfter.happiness,
        updatedAt: new Date()
      },
      include: { type: true }
    }),
    prisma.action.create({
      data: {
        animalId: id,
        actionType: 'sleep',
        hungerBefore: statsBefore.hunger,
        happinessBefore: statsBefore.happiness,
        healthBefore: statsBefore.health,
        energyBefore: statsBefore.energy,
        hungerAfter: statsAfter.hunger,
        happinessAfter: statsAfter.happiness,
        healthAfter: statsAfter.health,
        energyAfter: statsAfter.energy
      }
    })
  ])

  return updatedAnimal
}

export const tickAnimal = async (id: string) => {
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

  // Health decreases only if hunger or happiness < 20
  const newHealth = (newHunger < 20 || newHappiness < 20)
    ? Math.max(0, animal.health - hoursElapsed * animal.type.healthDecayRate)
    : animal.health

  // Death if health = 0
  const isAlive = newHealth > 0

  return getPrismaClient().animal.update({
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
  return getPrismaClient().action.findMany({
    where: { animalId },
    include: { item: true },
    orderBy: { timestamp: 'desc' },
    take: 20
  })
}

export const recordAction = async (animalId: string, actionType: string, itemId?: string) => {
  return getPrismaClient().action.create({
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
  return getPrismaClient().item.findMany()
}

export const getItemById = async (id: string) => {
  return getPrismaClient().item.findUnique({
    where: { id }
  })
}

export const getItemsByType = async (type: string) => {
  return getPrismaClient().item.findMany({
    where: { type }
  })
}

export const useItem = async (animalId: string, itemId: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id: animalId } })
  const item = await prisma.item.findUnique({ where: { id: itemId } })
  const inventoryEntry = await prisma.inventory.findUnique({ where: { itemId } })

  if (!animal) throw new Error('Animal not found')
  if (!item) throw new Error('Item not found')
  if (!inventoryEntry || inventoryEntry.quantity <= 0) throw new Error('Item out of stock')
  if (animal.energy < item.energyCost) throw new Error('NOT_ENOUGH_ENERGY')

  // Capture stats before
  const statsBefore = {
    hunger: animal.hunger,
    happiness: animal.happiness,
    health: animal.health,
    energy: animal.energy
  }

  // Calculate new stats
  const statsAfter = {
    hunger: Math.min(100, animal.hunger + item.hungerBoost),
    happiness: Math.min(100, animal.happiness + item.happinessBoost),
    health: Math.min(100, animal.health + item.healthBoost),
    energy: Math.max(0, animal.energy + item.energyBoost - item.energyCost)
  }

  // Transaction: update animal, decrement inventory, record action
  const [updatedAnimal] = await prisma.$transaction([
    prisma.animal.update({
      where: { id: animalId },
      data: {
        ...statsAfter,
        updatedAt: new Date()
      },
      include: { type: true }
    }),
    prisma.inventory.update({
      where: { itemId },
      data: { quantity: { decrement: 1 } }
    }),
    prisma.action.create({
      data: {
        animalId,
        actionType: 'use_item',
        itemId,
        hungerBefore: statsBefore.hunger,
        happinessBefore: statsBefore.happiness,
        healthBefore: statsBefore.health,
        energyBefore: statsBefore.energy,
        hungerAfter: statsAfter.hunger,
        happinessAfter: statsAfter.happiness,
        healthAfter: statsAfter.health,
        energyAfter: statsAfter.energy
      }
    })
  ])

  return updatedAnimal
}

// Inventory operations
export const getInventory = async () => {
  return getPrismaClient().inventory.findMany({
    include: { item: true },
    orderBy: { item: { type: 'asc' } }
  })
}

export const getInventoryByType = async (type: string) => {
  return getPrismaClient().inventory.findMany({
    where: { item: { type } },
    include: { item: true }
  })
}

// Action history with stats delta
export const getActionHistory = async (animalId: string, limit = 20) => {
  return getPrismaClient().action.findMany({
    where: { animalId },
    include: { item: true },
    orderBy: { timestamp: 'desc' },
    take: limit
  })
}
