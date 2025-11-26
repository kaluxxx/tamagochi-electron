import { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@/features/audio'
import { AudioPanelContent } from './audio-panel-content'
import { cn } from '@/shared/lib/utils'

interface AudioControlsProps {
  compact?: boolean
  className?: string
}

export function AudioControls({ compact = false, className }: AudioControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { isMusicMuted, isSfxMuted, toggleMusicMute, toggleSfxMute, playSfx } = useAudio()

  const isMuted = isMusicMuted && isSfxMuted

  const handleToggleAll = () => {
    if (isMuted) {
      if (isMusicMuted) toggleMusicMute()
      if (isSfxMuted) toggleSfxMute()
    } else {
      if (!isMusicMuted) toggleMusicMute()
      if (!isSfxMuted) toggleSfxMute()
    }
    playSfx('click')
  }

  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'p-2 border-4 border-white rounded-button shadow-lg transition-all duration-200',
            'hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0',
            isMuted
              ? 'bg-gradient-to-br from-gray-400 to-gray-500'
              : 'bg-gradient-to-br from-primary-pink to-pink-600'
          )}
          title={isMuted ? 'Son désactivé' : 'Son activé'}
        >
          {isMuted ? (
            <VolumeX size={20} className="text-white" />
          ) : (
            <Volume2 size={20} className="text-white" />
          )}
        </button>

        {isExpanded && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-bg-light border-4 border-white rounded-card shadow-xl p-4 space-y-4 z-50">
            <AudioPanelContent isMuted={isMuted} onToggleAll={handleToggleAll} playSfx={playSfx} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('bg-bg-light border-4 border-white rounded-card p-4 shadow-lg space-y-4', className)}>
      <AudioPanelContent isMuted={isMuted} onToggleAll={handleToggleAll} playSfx={playSfx} />
    </div>
  )
}
