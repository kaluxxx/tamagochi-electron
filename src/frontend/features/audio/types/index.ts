export type GameRoute =
  | '/'
  | '/shop'
  | '/minigames'
  | '/minigames/clicker'
  | '/minigames/fishing'
  | '/animals/create'

export type SfxType =
  | 'click'
  | 'purchase_success'
  | 'purchase_fail'
  | 'feed'
  | 'play'
  | 'heal'
  | 'sleep'
  | 'coin_collect'
  | 'fish_bite'
  | 'fish_catch'
  | 'fish_escape'
  | 'upgrade_purchase'

export interface AudioSettings {
  musicVolume: number // 0.0 - 1.0
  sfxVolume: number // 0.0 - 1.0
  isMusicMuted: boolean
  isSfxMuted: boolean
}

export interface MusicTrack {
  id: string
  src: string
  routes: GameRoute[]
  loop: boolean
  baseVolume: number
}

export interface SoundEffect {
  id: SfxType
  src: string
}
