import { cn } from '@frontend/shared/lib/utils'
import type { ItemFilter } from '../types'

interface InventoryFilterProps {
  selected: ItemFilter
  onChange: (filter: ItemFilter) => void
}

const filters: { value: ItemFilter; label: string }[] = [
  { value: 'all', label: 'TOUT' },
  { value: 'food', label: 'NOURRITURE' },
  { value: 'toy', label: 'JOUET' },
  { value: 'medicine', label: 'SOIN' },
]

export function InventoryFilter({ selected, onChange }: InventoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            'px-2 py-1 border-2 border-black font-pixel text-[7px] uppercase transition-colors',
            selected === filter.value
              ? 'bg-[#87CEEB] text-black'
              : 'bg-gray-200 text-black hover:bg-gray-300'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
