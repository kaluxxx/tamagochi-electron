import { getPrismaClient } from '../../../database/prisma'
import { animalRepository, actionRepository, type AnimalWithType, type ActionWithItem } from '../repositories'
import { walletRepository } from '../../economy/repositories'
import { NotFoundError, AnimalDeadError, ValidationError } from '../../../core/errors'
import { ECONOMY_CONFIG } from '../../economy/controllers'

export interface ActionResult {
  animal: AnimalWithType
  coinsEarned: number
}

export class ActionController {
  private static instance: ActionController

  private constructor() {}

  static getInstance(): ActionController {
    if (!ActionController.instance) {
      ActionController.instance = new ActionController()
    }
    return ActionController.instance
  }

  async feedAnimal(id: string): Promise<ActionResult> {
    const animal = await animalRepository.findById(id)
    if (!animal) {
      throw new NotFoundError('Animal', id)
    }
    if (!animal.isAlive) {
      throw new AnimalDeadError(id)
    }

    const statsBefore = {
      hunger: animal.hunger,
      happiness: animal.happiness,
      health: animal.health,
      energy: animal.energy
    }

    const statsAfter = {
      hunger: Math.min(100, animal.hunger + 20),
      happiness: Math.min(100, animal.happiness + 5),
      health: animal.health,
      energy: Math.max(0, animal.energy - 5)
    }

    const coinsEarned = ECONOMY_CONFIG.actionRewards.feed
    const wallet = await walletRepository.get()
    const prisma = getPrismaClient()

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

  async playWithAnimal(id: string): Promise<ActionResult> {
    const animal = await animalRepository.findById(id)
    if (!animal) {
      throw new NotFoundError('Animal', id)
    }
    if (!animal.isAlive) {
      throw new AnimalDeadError(id)
    }
    if (animal.energy < 20) {
      throw new ValidationError('Not enough energy to play')
    }

    const statsBefore = {
      hunger: animal.hunger,
      happiness: animal.happiness,
      health: animal.health,
      energy: animal.energy
    }

    const statsAfter = {
      hunger: Math.max(0, animal.hunger - 5),
      happiness: Math.min(100, animal.happiness + 15),
      health: animal.health,
      energy: Math.max(0, animal.energy - 10)
    }

    const coinsEarned = ECONOMY_CONFIG.actionRewards.play
    const wallet = await walletRepository.get()
    const prisma = getPrismaClient()

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

  async healAnimal(id: string): Promise<ActionResult> {
    const animal = await animalRepository.findById(id)
    if (!animal) {
      throw new NotFoundError('Animal', id)
    }
    if (!animal.isAlive) {
      throw new AnimalDeadError(id)
    }

    const statsBefore = {
      hunger: animal.hunger,
      happiness: animal.happiness,
      health: animal.health,
      energy: animal.energy
    }

    const statsAfter = {
      hunger: animal.hunger,
      happiness: animal.happiness,
      health: Math.min(100, animal.health + 20),
      energy: animal.energy
    }

    const coinsEarned = ECONOMY_CONFIG.actionRewards.heal
    const wallet = await walletRepository.get()
    const prisma = getPrismaClient()

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

  async sleepAnimal(id: string): Promise<ActionResult> {
    const animal = await animalRepository.findById(id)
    if (!animal) {
      throw new NotFoundError('Animal', id)
    }
    if (!animal.isAlive) {
      throw new AnimalDeadError(id)
    }
    if (animal.energy > 80) {
      throw new ValidationError('Not tired enough to sleep')
    }

    const statsBefore = {
      hunger: animal.hunger,
      happiness: animal.happiness,
      health: animal.health,
      energy: animal.energy
    }

    const statsAfter = {
      hunger: animal.hunger,
      happiness: Math.min(100, animal.happiness + 5),
      health: animal.health,
      energy: Math.min(100, animal.energy + 30)
    }

    const coinsEarned = ECONOMY_CONFIG.actionRewards.sleep
    const wallet = await walletRepository.get()
    const prisma = getPrismaClient()

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

  async getActionsByAnimalId(animalId: string): Promise<ActionWithItem[]> {
    return actionRepository.findByAnimalId(animalId)
  }

  async getActionHistory(animalId: string, limit = 20): Promise<ActionWithItem[]> {
    return actionRepository.findByAnimalId(animalId, limit)
  }
}

export const actionController = ActionController.getInstance()
