import type { ActionWithDelta as SharedActionWithDelta, Item as SharedItem } from '@/shared/types/window'

export type ActionType = 'feed' | 'play' | 'heal' | 'sleep' | 'use_item'

export type Item = SharedItem

export type ActionWithDelta = SharedActionWithDelta

export interface StatDelta {
  stat: 'hunger' | 'happiness' | 'health' | 'energy'
  before: number
  after: number
  delta: number
}
