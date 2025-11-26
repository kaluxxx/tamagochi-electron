import type { Animal, AnimalType } from '@prisma/client'
import { BaseRepository } from '../../../core/base.repository'

export type AnimalWithType = Animal & { type: AnimalType }

export interface AnimalCreateInput {
  name: string
  typeId: string
}

export interface AnimalUpdateInput {
  hunger?: number
  happiness?: number
  health?: number
  energy?: number
  age?: number
  isAlive?: boolean
  updatedAt?: Date
}

export interface AnimalStats {
  hunger: number
  happiness: number
  health: number
  energy: number
}

export class AnimalRepository extends BaseRepository<AnimalWithType, AnimalCreateInput, AnimalUpdateInput> {
  private static instance: AnimalRepository

  private constructor() {
    super()
  }

  static getInstance(): AnimalRepository {
    if (!AnimalRepository.instance) {
      AnimalRepository.instance = new AnimalRepository()
    }
    return AnimalRepository.instance
  }

  async findAll(): Promise<AnimalWithType[]> {
    return this.prisma.animal.findMany({
      include: { type: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: string): Promise<AnimalWithType | null> {
    return this.prisma.animal.findUnique({
      where: { id },
      include: { type: true }
    })
  }

  async findAlive(): Promise<AnimalWithType[]> {
    return this.prisma.animal.findMany({
      where: { isAlive: true },
      include: { type: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  async create(data: AnimalCreateInput): Promise<AnimalWithType> {
    return this.prisma.animal.create({
      data: {
        name: data.name,
        typeId: data.typeId
      },
      include: { type: true }
    })
  }

  async update(id: string, data: AnimalUpdateInput): Promise<AnimalWithType> {
    return this.prisma.animal.update({
      where: { id },
      data: {
        ...data,
        updatedAt: data.updatedAt ?? new Date()
      },
      include: { type: true }
    })
  }

  async delete(id: string): Promise<AnimalWithType> {
    return this.prisma.animal.delete({
      where: { id },
      include: { type: true }
    })
  }

  async updateStats(id: string, stats: AnimalStats): Promise<AnimalWithType> {
    return this.prisma.animal.update({
      where: { id },
      data: {
        hunger: stats.hunger,
        happiness: stats.happiness,
        health: stats.health,
        energy: stats.energy,
        updatedAt: new Date()
      },
      include: { type: true }
    })
  }
}

export const animalRepository = AnimalRepository.getInstance()
