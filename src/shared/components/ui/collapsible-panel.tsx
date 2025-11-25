import { cn } from '@/shared/lib/utils'
import type { ReactNode } from 'react'

interface CollapsiblePanelProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
  className?: string
}

export function CollapsiblePanel({
  title,
  isOpen,
  onToggle,
  children,
  className,
}: CollapsiblePanelProps) {
  return (
    <div
      className={cn(
        'bg-[#FFF4E6] border-4 border-black pixel-panel flex flex-col transition-all duration-200',
        isOpen ? 'flex-1 min-h-0' : 'flex-none',
        className
      )}
    >
      {/* Header - always visible and clickable */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full p-4 flex items-center justify-between',
          'hover:bg-[#FFE4C4] transition-colors',
          isOpen && 'border-b-4 border-black'
        )}
      >
        <h2 className="font-pixel text-[12px] text-black text-center uppercase tracking-wider flex-1">
          {title}
        </h2>
        <span className="font-pixel text-[10px] text-black ml-2">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {/* Content - only visible when open */}
      {isOpen && <div className="p-4 pt-4 flex-1 min-h-0 flex flex-col">{children}</div>}
    </div>
  )
}
