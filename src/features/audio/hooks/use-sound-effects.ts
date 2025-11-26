import { useCallback } from 'react'
import { audioManager } from '../services/audio-manager'
import type { SfxType } from '../types'

export function useSoundEffects() {
  const playSfx = useCallback((type: SfxType) => {
    audioManager.playSfx(type)
  }, [])

  return { playSfx }
}
