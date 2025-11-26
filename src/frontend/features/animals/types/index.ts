// Types pour les animaux

export interface AnimalType {
  id: string
  name: string
  displayName: string
  hungerDecayRate: number
  happinessDecayRate: number
  energyDecayRate: number
  healthDecayRate: number
  emoji: string
}

export interface Animal {
  id: string
  name: string
  typeId: string
  hunger: number
  happiness: number
  health: number
  energy: number
  age: number
  createdAt: Date
  updatedAt: Date
  isAlive: boolean
  type: AnimalType
}

export interface CreateAnimalInput {
  name: string
  typeId: string
}

export interface CreateAnimalDto {
  name: string
  typeId: string
}

export interface ActionResult {
  animal: Animal
  coinsEarned: number
}

export interface TickResult {
  animal: Animal
  justDied: boolean
  criticalStats: {
    hunger: boolean
    happiness: boolean
    energy: boolean
    health: boolean
  }
}
