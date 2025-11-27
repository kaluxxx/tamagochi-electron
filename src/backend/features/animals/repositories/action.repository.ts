import type { Action, Item } from '@/generated/prisma'
import { getPrismaClient } from '../../../database/prisma'

export type ActionWithItem = Action & { item: Item | null }

export interface ActionCreateInput {
  animalId: string
  actionType: string
  itemId?: string
  hungerBefore?: number
  happinessBefore?: number
  healthBefore?: number
  energyBefore?: number
  hungerAfter?: number
  happinessAfter?: number
  healthAfter?: number
  energyAfter?: number
  coinsEarned?: number
}

export class ActionRepository {
  private static instance: ActionRepository

  private constructor() {}

  static getInstance(): ActionRepository {
    if (!ActionRepository.instance) {
      ActionRepository.instance = new ActionRepository()
    }
    return ActionRepository.instance
  }

  private get prisma() {
    return getPrismaClient()
  }

  async findByAnimalId(animalId: string, limit = 20): Promise<ActionWithItem[]> {
    return this.prisma.action.findMany({
      where: { animalId },
      include: { item: true },
      orderBy: { timestamp: 'desc' },
      take: limit
    })
  }

  async create(data: ActionCreateInput): Promise<ActionWithItem> {
    return this.prisma.action.create({
      data: {
        animalId: data.animalId,
        actionType: data.actionType,
        itemId: data.itemId,
        hungerBefore: data.hungerBefore,
        happinessBefore: data.happinessBefore,
        healthBefore: data.healthBefore,
        energyBefore: data.energyBefore,
        hungerAfter: data.hungerAfter,
        happinessAfter: data.happinessAfter,
        healthAfter: data.healthAfter,
        energyAfter: data.energyAfter,
        coinsEarned: data.coinsEarned
      },
      include: { item: true }
    })
  }
}

export const actionRepository = ActionRepository.getInstance()
