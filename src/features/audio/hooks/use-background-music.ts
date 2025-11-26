import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'
import { audioManager } from '../services/audio-manager'
import { useAudioStore } from '../stores/audio-store'

export function useBackgroundMusic(): void {
  const location = useLocation()
  const { musicVolume, sfxVolume, isMusicMuted, isSfxMuted } = useAudioStore()

  // Initialize audio manager on mount
  useEffect(() => {
    audioManager.initialize()

    return () => {
      audioManager.stopMusic()
    }
  }, [])

  // Sync settings with audio manager
  useEffect(() => {
    audioManager.updateSettings({
      musicVolume,
      sfxVolume,
      isMusicMuted,
      isSfxMuted,
    })
  }, [musicVolume, sfxVolume, isMusicMuted, isSfxMuted])

  // Change music based on route
  useEffect(() => {
    audioManager.playMusicForRoute(location.pathname)
  }, [location.pathname])
}
