import { cn } from '@frontend/shared/lib/utils'
import type { InventoryItem as InventoryItemType } from '../types'

interface InventoryItemProps {
  inventoryItem: InventoryItemType
  isSelected: boolean
  canUse: boolean
  onClick: () => void
}

export function InventoryItem({ inventoryItem, isSelected, canUse, onClick }: InventoryItemProps) {
  const { item, quantity } = inventoryItem
  const isOutOfStock = quantity <= 0

  return (
    <button
      onClick={onClick}
      disabled={isOutOfStock}
      className={cn(
        'relative bg-white border-2 border-black p-2 flex flex-col items-center gap-1 transition-all',
        'hover:bg-[#FFE5EC] hover:scale-105',
        isSelected && 'ring-2 ring-[#FF6B9D] bg-[#FFE5EC]',
        isOutOfStock && 'opacity-50 cursor-not-allowed grayscale hover:scale-100 hover:bg-white',
        !canUse && !isOutOfStock && 'opacity-70'
      )}
    >
      {/* Quantity badge */}
      <span
        className={cn(
          'absolute -top-1 -right-1 px-1 min-w-[18px] text-center',
          'bg-[#FF6B9D] text-white font-pixel text-[8px] border border-black',
          isOutOfStock && 'bg-gray-400'
        )}
      >
        x{quantity}
      </span>

      {/* Item emoji */}
      <span className="text-2xl">{item.emoji}</span>

      {/* Item name */}
      <span className="font-pixel text-[7px] text-black text-center leading-tight">
        {item.name}
      </span>
    </button>
  )
}
