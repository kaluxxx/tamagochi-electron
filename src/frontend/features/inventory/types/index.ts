// Types pour les items et l'inventaire

export type ItemType = 'food' | 'toy' | 'medicine'
export type ItemFilter = ItemType | 'all'

export interface Item {
  id: string
  name: string
  type: string
  hungerBoost: number
  happinessBoost: number
  healthBoost: number
  energyBoost: number
  energyCost: number
  price: number
  emoji: string
  description: string
}

export interface InventoryItem {
  id: string
  itemId: string
  quantity: number
  item: Item
}
