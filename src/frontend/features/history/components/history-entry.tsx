import { StatsDeltaBadge } from './stats-delta-badge'
import type { ActionWithDelta } from '../types'

interface HistoryEntryProps {
  action: ActionWithDelta
}

const actionLabels: Record<string, string> = {
  feed: 'Nourri',
  play: 'Joue',
  heal: 'Soigne',
  sleep: 'Dort',
  use_item: 'Item',
}

const actionEmojis: Record<string, string> = {
  feed: '🍖',
  play: '🎮',
  heal: '💊',
  sleep: '😴',
  use_item: '📦',
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const actionDate = new Date(date)
  const diffMs = now.getTime() - actionDate.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'A l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins}min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays === 1) return 'Hier'
  return `Il y a ${diffDays}j`
}

export function HistoryEntry({ action }: HistoryEntryProps) {
  const emoji = action.actionType === 'use_item' && action.item
    ? action.item.emoji
    : actionEmojis[action.actionType] || '❓'

  const label = action.actionType === 'use_item' && action.item
    ? action.item.name
    : actionLabels[action.actionType] || action.actionType

  return (
    <div className="border-b border-gray-300 py-2 last:border-b-0">
      {/* Top row: action info + timestamp */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="text-sm">{emoji}</span>
          <span className="font-pixel text-[8px] text-black uppercase">{label}</span>
        </div>
        <span className="font-pixel text-[7px] text-gray-500">
          {formatRelativeTime(action.timestamp)}
        </span>
      </div>

      {/* Bottom row: stats delta */}
      <div className="flex flex-wrap gap-1">
        <StatsDeltaBadge
          stat="hunger"
          before={action.hungerBefore}
          after={action.hungerAfter}
        />
        <StatsDeltaBadge
          stat="happiness"
          before={action.happinessBefore}
          after={action.happinessAfter}
        />
        <StatsDeltaBadge
          stat="health"
          before={action.healthBefore}
          after={action.healthAfter}
        />
        <StatsDeltaBadge
          stat="energy"
          before={action.energyBefore}
          after={action.energyAfter}
        />
      </div>
    </div>
  )
}
