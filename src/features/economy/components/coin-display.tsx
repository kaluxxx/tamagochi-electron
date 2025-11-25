import { useWallet } from '@/features/economy'
import {cn} from "@/shared/lib/utils.ts";

interface CoinDisplayProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CoinDisplay({ size = 'md', className }: CoinDisplayProps) {
  const { coins, isLoading } = useWallet()

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  const iconSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-yellow-100 font-bold',
        sizeClasses[size],
        className
      )}
    >
      <span className={cn(iconSize[size])}>
        <span role="img" aria-label="coins">
          &#x1FA99;
        </span>
      </span>
      <span className="text-yellow-800">
        {isLoading ? '...' : coins.toLocaleString()}
      </span>
    </div>
  )
}
