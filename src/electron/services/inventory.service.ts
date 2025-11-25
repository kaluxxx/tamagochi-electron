import { getPrismaClient } from '../database/prisma'
import { getWallet, ECONOMY_CONFIG } from './economy.service'

// ============== ITEM OPERATIONS ==============

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

// ============== INVENTORY OPERATIONS ==============

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

// ============== USE ITEM ==============

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

  // Calculate coin reward
  const coinsEarned = ECONOMY_CONFIG.actionRewards.use_item
  const wallet = await getWallet()

  // Transaction: update animal, decrement inventory, record action, add coins
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
