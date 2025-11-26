interface MoodEffectsProps {
  mood: string
  isAlive: boolean
}

/**
 * Effets visuels selon le mood de l'animal (quand pas d'action en cours)
 */
export function MoodEffects({ mood, isAlive }: MoodEffectsProps) {
  if (!isAlive) return null

  switch (mood) {
    case 'happy':
      return (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[36px] text-pink-500 drop-shadow-[3px_3px_0_rgba(0,0,0,0.5)]">
          <span className="absolute -left-12 animate-heart">♥</span>
          <span className="absolute animate-heart-delay-1">♥</span>
          <span className="absolute left-12 animate-heart-delay-2">♥</span>
        </div>
      )

    case 'sad':
      return (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[28px] text-blue-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.4)]">
          <span className="absolute -left-10 animate-tear">💧</span>
          <span className="absolute animate-tear-delay-1">💧</span>
          <span className="absolute left-10 animate-tear-delay-2">💧</span>
        </div>
      )

    case 'sick':
      return (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[28px] drop-shadow-[2px_2px_0_rgba(0,0,0,0.4)]">
          <span className="absolute -left-10 animate-sick-spiral">💫</span>
          <span className="absolute animate-sick-spiral-delay-1">🤢</span>
          <span className="absolute left-10 animate-sick-spiral-delay-2">💫</span>
        </div>
      )

    default:
      return null
  }
}