import { getPrismaClient } from '@/electron/database/prisma'
import { getWallet, ECONOMY_CONFIG } from './economy.service'

// ============== ANIMAL ACTIONS ==============

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

  // Calculate coin reward
  const coinsEarned = ECONOMY_CONFIG.actionRewards.feed
  const wallet = await getWallet()

  // Transaction: update animal, record action, add coins
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
        energyAfter: statsAfter.energy,
        coinsEarned
      }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { increment: coinsEarned } }
    })
  ])

  return { animal: updatedAnimal, coinsEarned }
}

export const playWithAnimal = async (id: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')
  if (animal.energy < 20) throw new Error('Not enough energy')

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

  // Calculate coin reward
  const coinsEarned = ECONOMY_CONFIG.actionRewards.play
  const wallet = await getWallet()

  // Transaction: update animal, record action, add coins
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
        energyAfter: statsAfter.energy,
        coinsEarned
      }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { increment: coinsEarned } }
    })
  ])

  return { animal: updatedAnimal, coinsEarned }
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

  // Calculate coin reward
  const coinsEarned = ECONOMY_CONFIG.actionRewards.heal
  const wallet = await getWallet()

  // Transaction: update animal, record action, add coins
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
        energyAfter: statsAfter.energy,
        coinsEarned
      }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { increment: coinsEarned } }
    })
  ])

  return { animal: updatedAnimal, coinsEarned }
}

export const sleepAnimal = async (id: string) => {
  const prisma = getPrismaClient()
  const animal = await prisma.animal.findUnique({ where: { id } })
  if (!animal) throw new Error('Animal not found')
  if (animal.energy > 80) throw new Error('Not tired enough')

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

  // Calculate coin reward
  const coinsEarned = ECONOMY_CONFIG.actionRewards.sleep
  const wallet = await getWallet()

  // Transaction: update animal, record action, add coins
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
        energyAfter: statsAfter.energy,
        coinsEarned
      }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { increment: coinsEarned } }
    })
  ])

  return { animal: updatedAnimal, coinsEarned }
}

// ============== ACTION HISTORY ==============

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

export const getActionHistory = async (animalId: string, limit = 20) => {
  return getPrismaClient().action.findMany({
    where: { animalId },
    include: { item: true },
    orderBy: { timestamp: 'desc' },
    take: limit
  })
}
