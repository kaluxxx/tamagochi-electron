import { getPrismaClient } from '../../../database/prisma'
import { inventoryRepository, itemRepository, type InventoryWithItem } from '../repositories'
import { animalRepository, type AnimalWithType } from '../../animals/repositories'
import { walletRepository } from '../../economy/repositories'
import { NotFoundError, AnimalDeadError, ValidationError, InsufficientQuantityError } from '../../../core/errors'
import { ECONOMY_CONFIG } from '../../economy/controllers'

export interface UseItemResult {
  animal: AnimalWithType
  coinsEarned: number
}

export class InventoryController {
  private static instance: InventoryController

  private constructor() {}

  static getInstance(): InventoryController {
    if (!InventoryController.instance) {
      InventoryController.instance = new InventoryController()
    }
    return InventoryController.instance
  }

  async getInventory(): Promise<InventoryWithItem[]> {
    return inventoryRepository.findAll()
  }

  async getInventoryByType(type: string): Promise<InventoryWithItem[]> {
    return inventoryRepository.findByType(type)
  }

  async useItem(animalId: string, itemId: string): Promise<UseItemResult> {
    const prisma = getPrismaClient()

    const animal = await animalRepository.findById(animalId)
    if (!animal) {
      throw new NotFoundError('Animal', animalId)
    }
    if (!animal.isAlive) {
      throw new AnimalDeadError(animalId)
    }

    const item = await itemRepository.findById(itemId)
    if (!item) {
      throw new NotFoundError('Item', itemId)
    }

    const inventoryEntry = await inventoryRepository.findByItemId(itemId)
    if (!inventoryEntry || inventoryEntry.quantity <= 0) {
      throw new InsufficientQuantityError(item.name, 1, inventoryEntry?.quantity ?? 0)
    }

    if (animal.energy < item.energyCost) {
      throw new ValidationError(`Not enough energy. Required: ${item.energyCost}, Available: ${animal.energy}`)
    }

    const statsBefore = {
      hunger: animal.hunger,
      happiness: animal.happiness,
      health: animal.health,
      energy: animal.energy
    }

    const statsAfter = {
      hunger: Math.min(100, animal.hunger + item.hungerBoost),
      happiness: Math.min(100, animal.happiness + item.happinessBoost),
      health: Math.min(100, animal.health + item.healthBoost),
      energy: Math.max(0, animal.energy + item.energyBoost - item.energyCost)
    }

    const coinsEarned = ECONOMY_CONFIG.actionRewards.use_item
    const wallet = await walletRepository.get()

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
}

export const inventoryController = InventoryController.getInstance()
