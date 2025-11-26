// Types pour l'historique des actions

import type { Item } from '../../inventory/types'

export type ActionType = 'feed' | 'play' | 'heal' | 'sleep' | 'use_item'

export interface Action {
  id: string
  animalId: string
  actionType: string
  itemId?: string | null
  timestamp: Date
  hungerBefore?: number | null
  happinessBefore?: number | null
  healthBefore?: number | null
  energyBefore?: number | null
  hungerAfter?: number | null
  happinessAfter?: number | null
  healthAfter?: number | null
  energyAfter?: number | null
  coinsEarned?: number | null
  item?: Item | null
}

export interface ActionWithDelta extends Action {
  item?: Item | null
}

export interface StatDelta {
  stat: 'hunger' | 'happiness' | 'health' | 'energy'
  before: number
  after: number
  delta: number
}
