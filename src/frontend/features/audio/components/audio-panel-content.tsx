import { Music, Sparkles } from 'lucide-react'
import { useAudio } from '../hooks/use-audio'
import { VolumeControl } from './volume-control'
import { cn } from '@frontend/shared/lib/utils'

interface AudioPanelContentProps {
  isMuted: boolean
  onToggleAll: () => void
  playSfx: (type: 'click') => void
}

export function AudioPanelContent({ isMuted, onToggleAll, playSfx }: AudioPanelContentProps) {
  const {
    musicVolume,
    sfxVolume,
    isMusicMuted,
    isSfxMuted,
    setMusicVolume,
    setSfxVolume,
    toggleMusicMute,
    toggleSfxMute,
  } = useAudio()

  const handleToggleWithSound = (toggle: () => void) => () => {
    toggle()
    playSfx('click')
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-pixel text-xs text-text-primary">AUDIO</span>
        <button
          onClick={onToggleAll}
          className={cn(
            'px-2 py-1 border-2 border-white rounded font-pixel text-[8px] transition-colors',
            isMuted ? 'bg-gray-300 text-gray-600' : 'bg-success-green text-white'
          )}
        >
          {isMuted ? 'OFF' : 'ON'}
        </button>
      </div>

      {/* Music control */}
      <VolumeControl
        icon={<Music size={14} className="text-primary-blue" />}
        label="MUSIQUE"
        volume={musicVolume}
        isMuted={isMusicMuted}
        onVolumeChange={setMusicVolume}
        onToggleMute={handleToggleWithSound(toggleMusicMute)}
        accentColor="bg-primary-blue"
      />

      {/* SFX control */}
      <VolumeControl
        icon={<Sparkles size={14} className="text-primary-yellow" />}
        label="EFFETS"
        volume={sfxVolume}
        isMuted={isSfxMuted}
        onVolumeChange={setSfxVolume}
        onToggleMute={handleToggleWithSound(toggleSfxMute)}
        accentColor="bg-primary-yellow"
      />
    </>
  )
}
