import { useAudioStore } from '../stores/audio-store'
import { useSoundEffects } from './use-sound-effects'

export function useAudio() {
  const {
    musicVolume,
    sfxVolume,
    isMusicMuted,
    isSfxMuted,
    setMusicVolume,
    setSfxVolume,
    toggleMusicMute,
    toggleSfxMute,
    setMusicMuted,
    setSfxMuted,
    resetToDefaults,
  } = useAudioStore()

  const { playSfx } = useSoundEffects()

  return {
    // State
    musicVolume,
    sfxVolume,
    isMusicMuted,
    isSfxMuted,
    // Actions
    setMusicVolume,
    setSfxVolume,
    toggleMusicMute,
    toggleSfxMute,
    setMusicMuted,
    setSfxMuted,
    resetToDefaults,
    playSfx,
  }
}
