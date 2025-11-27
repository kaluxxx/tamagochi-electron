import type { FishSpecies } from '@/generated/prisma'
import { ReadOnlyRepository } from '../../../core/base.repository'

export class FishSpeciesRepository extends ReadOnlyRepository<FishSpecies> {
  private static instance: FishSpeciesRepository

  private constructor() {
    super()
  }

  static getInstance(): FishSpeciesRepository {
    if (!FishSpeciesRepository.instance) {
      FishSpeciesRepository.instance = new FishSpeciesRepository()
    }
    return FishSpeciesRepository.instance
  }

  async findAll(): Promise<FishSpecies[]> {
    return this.prisma.fishSpecies.findMany({
      orderBy: [
        { rarity: 'asc' },
        { name: 'asc' }
      ]
    })
  }

  async findById(id: string): Promise<FishSpecies | null> {
    return this.prisma.fishSpecies.findUnique({
      where: { id }
    })
  }

  async findByName(name: string): Promise<FishSpecies | null> {
    return this.prisma.fishSpecies.findUnique({
      where: { name }
    })
  }

  async findByIds(ids: string[]): Promise<FishSpecies[]> {
    return this.prisma.fishSpecies.findMany({
      where: { id: { in: ids } }
    })
  }
}

export const fishSpeciesRepository = FishSpeciesRepository.getInstance()
