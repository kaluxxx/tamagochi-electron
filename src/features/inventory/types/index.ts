import type { Item as SharedItem, InventoryItem as SharedInventoryItem } from '@/shared/types/window'

export type ItemType = 'food' | 'toy' | 'medicine'

export type Item = SharedItem

export type InventoryItem = SharedInventoryItem

export type ItemFilter = ItemType | 'all'
