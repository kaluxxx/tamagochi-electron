import type { ReactNode } from 'react'
import { ToggleSwitch } from './toggle-switch'
import { VolumeSlider } from './volume-slider'

interface VolumeControlProps {
  icon: ReactNode
  label: string
  volume: number
  isMuted: boolean
  onVolumeChange: (value: number) => void
  onToggleMute: () => void
  accentColor: string
  showSlider?: boolean
}

export function VolumeControl({
  icon,
  label,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  accentColor,
  showSlider = true,
}: VolumeControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-pixel text-[8px] text-text-secondary">{label}</span>
        </div>
        <ToggleSwitch isOn={!isMuted} onToggle={onToggleMute} activeColor={accentColor} />
      </div>
      {showSlider && !isMuted && (
        <VolumeSlider
          value={volume}
          onChange={onVolumeChange}
          accentColor={`accent-${accentColor.replace('bg-', '')}`}
        />
      )}
    </div>
  )
}
