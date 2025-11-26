import { Howl, Howler } from 'howler'
import type { AudioSettings, SfxType } from '../types'
import {
  MUSIC_TRACKS,
  SOUND_EFFECTS,
  getTrackForRoute,
} from '@/features/audio'

// Transition rapide (200ms)
const FADE_DURATION = 200

class AudioManager {
  private musicTracks: Map<string, Howl> = new Map()
  private sfxSounds: Map<SfxType, Howl> = new Map()
  private currentTrackId: string | null = null
  private isInitialized = false
  private pendingRoute: string | null = null
  private settings: AudioSettings = {
    musicVolume: 0.5,
    sfxVolume: 0.7,
    isMusicMuted: false,
    isSfxMuted: false,
  }

  initialize(): void {
    if (this.isInitialized) return

    // Preload all music tracks (sans html5 pour meilleur support autoplay)
    MUSIC_TRACKS.forEach((track) => {
      const howl = new Howl({
        src: [track.src],
        loop: track.loop,
        volume: track.baseVolume * this.settings.musicVolume,
        preload: true,
        onload: () => {
          // Start pending music once the correct track is loaded
          if (this.pendingRoute) {
            const pendingTrack = getTrackForRoute(this.pendingRoute)
            if (pendingTrack && pendingTrack.id === track.id) {
              this.pendingRoute = null
              this.switchTrack(track.id)
            }
          }
        },
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
      if (howl && track) {
        const targetVolume = settings.isMusicMuted
          ? 0
          : track.baseVolume * settings.musicVolume
        howl.volume(targetVolume)
      }
    }
  }

  playMusicForRoute(pathname: string): void {
    if (!this.isInitialized) {
      this.initialize()
      // Store route to play once loaded
      this.pendingRoute = pathname
      return
    }

    const track = getTrackForRoute(pathname)
    if (!track) return

    // Don't restart if already playing the same track
    if (this.currentTrackId === track.id) return

    // Check if track is loaded
    const howl = this.musicTracks.get(track.id)
    if (howl && howl.state() === 'loaded') {
      this.switchTrack(track.id)
    } else {
      // Store route to play once loaded
      this.pendingRoute = pathname
    }
  }

  private switchTrack(targetTrackId: string): void {
    const targetHowl = this.musicTracks.get(targetTrackId)
    const targetTrack = MUSIC_TRACKS.find((t) => t.id === targetTrackId)
    if (!targetHowl || !targetTrack) return

    const targetVolume = this.settings.isMusicMuted
      ? 0
      : targetTrack.baseVolume * this.settings.musicVolume

    // Stop current track with quick fade
    if (this.currentTrackId) {
      const currentHowl = this.musicTracks.get(this.currentTrackId)
      if (currentHowl && currentHowl.playing()) {
        currentHowl.fade(currentHowl.volume() as number, 0, FADE_DURATION)
        globalThis.setTimeout(() => {
          currentHowl.stop()
        }, FADE_DURATION)
      }
    }

    // Start new track with quick fade in
    targetHowl.volume(0)
    targetHowl.play()
    targetHowl.fade(0, targetVolume, FADE_DURATION)

    this.currentTrackId = targetTrackId
  }

  stopMusic(): void {
    if (this.currentTrackId) {
      const howl = this.musicTracks.get(this.currentTrackId)
      if (howl) {
        howl.fade(howl.volume() as number, 0, FADE_DURATION)
        globalThis.setTimeout(() => {
          howl.stop()
        }, FADE_DURATION)
      }
      this.currentTrackId = null
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
