import { cn } from '@frontend/shared/lib/utils'

interface StatsDeltaBadgeProps {
  stat: 'hunger' | 'happiness' | 'health' | 'energy'
  before?: number | null
  after?: number | null
}

const statEmojis: Record<string, string> = {
  hunger: '🍖',
  happiness: '😊',
  health: '❤️',
  energy: '⚡',
}

export function StatsDeltaBadge({ stat, before, after }: StatsDeltaBadgeProps) {
  if (before === undefined || before === null || after === undefined || after === null) {
    return null
  }

  const delta = after - before
  if (delta === 0) return null

  const isPositive = delta > 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-pixel text-[7px]',
        isPositive ? 'text-green-600' : 'text-red-600'
      )}
    >
      {statEmojis[stat]}
      {isPositive ? `+${delta}` : delta}
    </span>
  )
}
