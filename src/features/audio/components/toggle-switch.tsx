import { cn } from '@/shared/lib/utils'

interface ToggleSwitchProps {
  isOn: boolean
  onToggle: () => void
  activeColor: string
}

export function ToggleSwitch({ isOn, onToggle, activeColor }: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-8 h-4 rounded-full transition-colors relative',
        isOn ? activeColor : 'bg-gray-300'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow',
          isOn ? 'left-4' : 'left-0.5'
        )}
      />
    </button>
  )
}
