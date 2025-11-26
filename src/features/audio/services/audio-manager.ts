import { Howl, Howler } from 'howler'
import type { AudioSettings, SfxType } from '../types'
import {
  MUSIC_TRACKS,
  SOUND_EFFECTS,
  CROSSFADE_DURATION,
  getTrackForRoute,
} from '@/features/audio'

class AudioManager {
  private musicTracks: Map<string, Howl> = new Map()
  private sfxSounds: Map<SfxType, Howl> = new Map()
  private currentTrackId: string | null = null
  private currentTrackHowlId: number | null = null
  private isInitialized = false
  private settings: AudioSettings = {
    musicVolume: 0.5,
    sfxVolume: 0.7,
    isMusicMuted: false,
    isSfxMuted: false,
  }

  initialize(): void {
    if (this.isInitialized) return

    // Preload all music tracks
    MUSIC_TRACKS.forEach((track) => {
      const howl = new Howl({
        src: [track.src],
        loop: track.loop,
        volume: 0,
        preload: true,
        html5: true, // Better for long audio files
        onloaderror: (_id, error) => {
          console.warn(`Failed to load music track ${track.id}:`, error)
        },
      })
      this.musicTracks.set(track.id, howl)
    })

    // Preload all sound effects
    SOUND_EFFECTS.forEach((sfx) => {
      const howl = new Howl({
        src: [sfx.src],
        preload: true,
        volume: this.settings.sfxVolume,
        onloaderror: (_id, error) => {
          console.warn(`Failed to load SFX ${sfx.id}:`, error)
        },
      })
      this.sfxSounds.set(sfx.id, howl)
    })

    this.isInitialized = true
  }

  updateSettings(settings: AudioSettings): void {
    this.settings = settings

    // Update SFX volumes
    this.sfxSounds.forEach((howl) => {
      howl.volume(settings.isSfxMuted ? 0 : settings.sfxVolume)
    })

    // Update current music volume if playing
    if (this.currentTrackId) {
      const howl = this.musicTracks.get(this.currentTrackId)
      const track = MUSIC_TRACKS.find((t) => t.id === this.currentTrackId)
      if (howl && track && this.currentTrackHowlId !== null) {
        const targetVolume = settings.isMusicMuted
          ? 0
          : track.baseVolume * settings.musicVolume
        howl.volume(targetVolume, this.currentTrackHowlId)
      }
    }
  }

  playMusicForRoute(pathname: string): void {
    if (!this.isInitialized) {
      this.initialize()
    }

    const track = getTrackForRoute(pathname)
    if (!track) return

    // Don't restart if already playing the same track
    if (this.currentTrackId === track.id) return

    this.crossfadeTo(track.id)
  }

  private crossfadeTo(targetTrackId: string): void {
    const targetHowl = this.musicTracks.get(targetTrackId)
    const targetTrack = MUSIC_TRACKS.find((t) => t.id === targetTrackId)
    if (!targetHowl || !targetTrack) return

    const targetVolume = this.settings.isMusicMuted
      ? 0
      : targetTrack.baseVolume * this.settings.musicVolume

    // Fade out current track if playing
    if (this.currentTrackId && this.currentTrackHowlId !== null) {
      const currentHowl = this.musicTracks.get(this.currentTrackId)
      if (currentHowl) {
        const currentHowlId = this.currentTrackHowlId
        currentHowl.fade(
          currentHowl.volume(currentHowlId) as number,
          0,
          CROSSFADE_DURATION
        )
        // Stop after fade completes
        globalThis.setTimeout(() => {
          currentHowl.stop(currentHowlId)
        }, CROSSFADE_DURATION)
      }
    }

    // Start new track with fade in
    const newHowlId = targetHowl.play()
    targetHowl.volume(0, newHowlId)
    targetHowl.fade(0, targetVolume, CROSSFADE_DURATION, newHowlId)

    this.currentTrackId = targetTrackId
    this.currentTrackHowlId = newHowlId
  }

  stopMusic(): void {
    if (this.currentTrackId && this.currentTrackHowlId !== null) {
      const howl = this.musicTracks.get(this.currentTrackId)
      if (howl) {
        howl.fade(
          howl.volume(this.currentTrackHowlId) as number,
          0,
          CROSSFADE_DURATION / 2
        )
        const howlId = this.currentTrackHowlId
        globalThis.setTimeout(() => {
          howl.stop(howlId)
        }, CROSSFADE_DURATION / 2)
      }
      this.currentTrackId = null
      this.currentTrackHowlId = null
    }
  }

  playSfx(type: SfxType): void {
    if (!this.isInitialized) {
      this.initialize()
    }

    if (this.settings.isSfxMuted) return

    const sound = this.sfxSounds.get(type)
    if (sound) {
      sound.volume(this.settings.sfxVolume)
      sound.play()
    }
  }

  setGlobalMute(muted: boolean): void {
    Howler.mute(muted)
  }

  cleanup(): void {
    this.musicTracks.forEach((howl) => howl.unload())
    this.sfxSounds.forEach((howl) => howl.unload())
    this.musicTracks.clear()
    this.sfxSounds.clear()
    this.currentTrackId = null
    this.currentTrackHowlId = null
    this.isInitialized = false
  }

  get isReady(): boolean {
    return this.isInitialized
  }

  get currentTrack(): string | null {
    return this.currentTrackId
  }
}

// Singleton instance
export const audioManager = new AudioManager()
