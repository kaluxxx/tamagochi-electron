// Types pour l'API Electron exposée via Context Bridge

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

export interface Action {
  id: string
  animalId: string
  actionType: string
  itemId?: string | null
  timestamp: Date
  // Stats delta
  hungerBefore?: number | null
  happinessBefore?: number | null
  healthBefore?: number | null
  energyBefore?: number | null
  hungerAfter?: number | null
  happinessAfter?: number | null
  healthAfter?: number | null
  energyAfter?: number | null
  item?: Item | null
}

export interface ActionWithDelta extends Action {
  item?: Item | null
}

export interface InventoryItem {
  id: string
  itemId: string
  quantity: number
  item: Item
}

export interface Item {
  id: string
  name: string
  type: string
  hungerBoost: number
  happinessBoost: number
  healthBoost: number
  energyBoost: number
  energyCost: number
  emoji: string
  description: string
}

export interface CreateAnimalInput {
  name: string
  typeId: string
}

declare global {
  interface Window {
    api: {
      animalTypes: {
        getAll: () => Promise<AnimalType[]>
        getById: (id: string) => Promise<AnimalType | null>
      }
      animals: {
        getAll: () => Promise<Animal[]>
        getById: (id: string) => Promise<Animal | null>
        create: (data: CreateAnimalInput) => Promise<Animal>
        feed: (id: string) => Promise<Animal>
        play: (id: string) => Promise<Animal>
        heal: (id: string) => Promise<Animal>
        sleep: (id: string) => Promise<Animal>
        tick: (id: string) => Promise<Animal>
      }
      actions: {
        getByAnimalId: (animalId: string) => Promise<Action[]>
      }
      items: {
        getAll: () => Promise<Item[]>
        getById: (id: string) => Promise<Item | null>
        getByType: (type: string) => Promise<Item[]>
        useItem: (animalId: string, itemId: string) => Promise<Animal>
      }
      inventory: {
        getAll: () => Promise<InventoryItem[]>
        getByType: (type: string) => Promise<InventoryItem[]>
      }
      history: {
        getByAnimalId: (animalId: string, limit?: number) => Promise<ActionWithDelta[]>
      }
    }
  }
}

export {}
