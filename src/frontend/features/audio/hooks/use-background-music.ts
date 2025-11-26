import { useEffect, useRef } from 'react'
import { useLocation } from '@tanstack/react-router'
import { audioManager } from '../services/audio-manager'
import { useAudioStore } from '../stores/audio-store'

export function useBackgroundMusic(): void {
  const location = useLocation()
  const { musicVolume, sfxVolume, isMusicMuted, isSfxMuted } = useAudioStore()
  const hasStartedRef = useRef(false)

  // Initialize and start music on mount
  useEffect(() => {
    audioManager.initialize()

    // Update settings first
    audioManager.updateSettings({
      musicVolume,
      sfxVolume,
      isMusicMuted,
      isSfxMuted,
    })

    // Then start playing for current route
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      audioManager.playMusicForRoute(location.pathname)
    }

    return () => {
      audioManager.stopMusic()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Sync settings with audio manager when they change
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
    if (hasStartedRef.current) {
      audioManager.playMusicForRoute(location.pathname)
    }
  }, [location.pathname])
}
