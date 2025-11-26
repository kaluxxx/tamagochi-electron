import type { MusicTrack, SoundEffect, GameRoute, AudioSettings } from '../types'

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'main-theme',
    src: '/audio/music/main-theme.mp3',
    routes: ['/', '/animals/create'],
    loop: true,
    baseVolume: 0.5,
  },
  {
    id: 'shop-theme',
    src: '/audio/music/shop-theme.mp3',
    routes: ['/shop'],
    loop: true,
    baseVolume: 0.5,
  },
  {
    id: 'clicker-theme',
    src: '/audio/music/clicker-theme.mp3',
    routes: ['/minigames/clicker'],
    loop: true,
    baseVolume: 0.6,
  },
  {
    id: 'fishing-theme',
    src: '/audio/music/fishing-theme.mp3',
    routes: ['/minigames/fishing'],
    loop: true,
    baseVolume: 0.5,
  },
  {
    id: 'minigames-hub',
    src: '/audio/music/minigames-hub.mp3',
    routes: ['/minigames'],
    loop: true,
    baseVolume: 0.5,
  },
]

export const SOUND_EFFECTS: SoundEffect[] = [
  { id: 'click', src: '/audio/sfx/click.mp3' },
  { id: 'purchase_success', src: '/audio/sfx/purchase-success.mp3' },
  { id: 'purchase_fail', src: '/audio/sfx/purchase-fail.mp3' },
  { id: 'feed', src: '/audio/sfx/feed.mp3' },
  { id: 'play', src: '/audio/sfx/play.mp3' },
  { id: 'heal', src: '/audio/sfx/heal.mp3' },
  { id: 'sleep', src: '/audio/sfx/sleep.mp3' },
  { id: 'coin_collect', src: '/audio/sfx/coin-collect.mp3' },
  { id: 'fish_bite', src: '/audio/sfx/fish-bite.mp3' },
  { id: 'fish_catch', src: '/audio/sfx/fish-catch.mp3' },
  { id: 'fish_escape', src: '/audio/sfx/fish-escape.mp3' },
  { id: 'upgrade_purchase', src: '/audio/sfx/upgrade-purchase.mp3' },
]

export const CROSSFADE_DURATION = 1000 // milliseconds

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.7,
  isMusicMuted: false,
  isSfxMuted: false,
}

export function getTrackForRoute(pathname: string): MusicTrack | undefined {
  // Exact match first
  const exactMatch = MUSIC_TRACKS.find((track) =>
    track.routes.includes(pathname as GameRoute)
  )
  if (exactMatch) return exactMatch

  // Fallback: minigames routes without specific track use minigames-hub
  if (pathname.startsWith('/minigames')) {
    return MUSIC_TRACKS.find((track) => track.id === 'minigames-hub')
  }

  // Default to main theme
  return MUSIC_TRACKS.find((track) => track.id === 'main-theme')
}
