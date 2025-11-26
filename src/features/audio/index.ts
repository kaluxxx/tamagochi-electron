// Components
export { AudioControls } from './components/audio-controls'

// Hooks
export { useAudio } from './hooks/use-audio'
export { useBackgroundMusic } from './hooks/use-background-music'
export { useSoundEffects } from './hooks/use-sound-effects'

// Store
export { useAudioStore } from './stores/audio-store'

// Types
export type {
  AudioSettings,
  GameRoute,
  SfxType,
  MusicTrack,
  SoundEffect,
} from './types'

// Constants
export {
  MUSIC_TRACKS,
  SOUND_EFFECTS,
  CROSSFADE_DURATION,
  DEFAULT_AUDIO_SETTINGS,
  getTrackForRoute,
} from './constants/tracks'
