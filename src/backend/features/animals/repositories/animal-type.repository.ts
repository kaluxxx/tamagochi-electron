import type { AnimalType } from '@/generated/prisma'
import { ReadOnlyRepository } from '../../../core/base.repository'

export class AnimalTypeRepository extends ReadOnlyRepository<AnimalType> {
  private static instance: AnimalTypeRepository

  private constructor() {
    super()
  }

  static getInstance(): AnimalTypeRepository {
    if (!AnimalTypeRepository.instance) {
      AnimalTypeRepository.instance = new AnimalTypeRepository()
    }
    return AnimalTypeRepository.instance
  }

  async findAll(): Promise<AnimalType[]> {
    return this.prisma.animalType.findMany()
  }

  async findById(id: string): Promise<AnimalType | null> {
    return this.prisma.animalType.findUnique({
      where: { id }
    })
  }
}

export const animalTypeRepository = AnimalTypeRepository.getInstance()
