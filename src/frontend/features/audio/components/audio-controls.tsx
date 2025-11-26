import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@frontend/features/audio'
import { AudioPanelContent } from './audio-panel-content'
import { cn } from '@frontend/shared/lib/utils'

interface AudioControlsProps {
  compact?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AudioControls({ compact = false, size = 'md', className }: AudioControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { isMusicMuted, isSfxMuted, toggleMusicMute, toggleSfxMute, playSfx } = useAudio()
  const panelRef = useRef<HTMLDivElement>(null)

  const isMuted = isMusicMuted && isSfxMuted

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as globalThis.Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

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

  const sizeClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  }

  const iconSize = {
    sm: 14,
    md: 16,
    lg: 20,
  }

  if (compact) {
    return (
      <div className={cn('relative', className)} ref={panelRef}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'inline-flex items-center justify-center gap-1 rounded-lg border-2 border-black font-bold transition-all',
            'hover:brightness-95 active:translate-y-0.5',
            sizeClasses[size],
            isMuted
              ? 'bg-gray-200 text-gray-500'
              : 'bg-purple-200 text-purple-700'
          )}
          title={isMuted ? 'Son désactivé' : 'Son activé'}
        >
          {isMuted ? (
            <VolumeX size={iconSize[size]} />
          ) : (
            <Volume2 size={iconSize[size]} />
          )}
        </button>

        {isExpanded && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-[#FFF4E6] border-4 border-black rounded-lg shadow-xl p-4 space-y-4 z-50">
            <AudioPanelContent isMuted={isMuted} onToggleAll={handleToggleAll} playSfx={playSfx} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('bg-[#FFF4E6] border-4 border-black rounded-lg p-4 shadow-lg space-y-4', className)}>
      <AudioPanelContent isMuted={isMuted} onToggleAll={handleToggleAll} playSfx={playSfx} />
    </div>
  )
}
