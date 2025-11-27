import { cn } from '@frontend/shared/lib/utils'

interface VolumeSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  accentColor: string
}

export function VolumeSlider({ value, onChange, disabled, accentColor }: VolumeSliderProps) {
  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.1"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      disabled={disabled}
      className={cn(
        'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
        accentColor,
        disabled && 'opacity-50'
      )}
    />
  )
}
