import type { AnimalType } from '@/generated/prisma'
import { animalTypeRepository } from '../repositories'
import { NotFoundError } from '../../../core/errors'

export class AnimalTypeController {
  private static instance: AnimalTypeController

  private constructor() {}

  static getInstance(): AnimalTypeController {
    if (!AnimalTypeController.instance) {
      AnimalTypeController.instance = new AnimalTypeController()
    }
    return AnimalTypeController.instance
  }

  async getAllTypes(): Promise<AnimalType[]> {
    return animalTypeRepository.findAll()
  }

  async getTypeById(id: string): Promise<AnimalType> {
    const type = await animalTypeRepository.findById(id)
    if (!type) {
      throw new NotFoundError('AnimalType', id)
    }
    return type
  }
}

export const animalTypeController = AnimalTypeController.getInstance()
