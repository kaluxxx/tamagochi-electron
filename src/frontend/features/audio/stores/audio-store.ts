import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AudioSettings } from '../types'
import { DEFAULT_AUDIO_SETTINGS } from '../constants/tracks'

interface AudioStoreState extends AudioSettings {
  // Actions
  setMusicVolume: (volume: number) => void
  setSfxVolume: (volume: number) => void
  toggleMusicMute: () => void
  toggleSfxMute: () => void
  setMusicMuted: (muted: boolean) => void
  setSfxMuted: (muted: boolean) => void
  resetToDefaults: () => void
}

export const useAudioStore = create<AudioStoreState>()(
  persist(
    (set) => ({
      ...DEFAULT_AUDIO_SETTINGS,

      setMusicVolume: (volume) =>
        set({ musicVolume: Math.max(0, Math.min(1, volume)) }),

      setSfxVolume: (volume) =>
        set({ sfxVolume: Math.max(0, Math.min(1, volume)) }),

      toggleMusicMute: () =>
        set((state) => ({ isMusicMuted: !state.isMusicMuted })),

      toggleSfxMute: () =>
        set((state) => ({ isSfxMuted: !state.isSfxMuted })),

      setMusicMuted: (muted) => set({ isMusicMuted: muted }),

      setSfxMuted: (muted) => set({ isSfxMuted: muted }),

      resetToDefaults: () => set(DEFAULT_AUDIO_SETTINGS),
    }),
    {
      name: 'tamagotchi-audio-settings',
    }
  )
)
