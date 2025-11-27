interface ActionEffectsProps {
  isSleeping: boolean
  isPlaying: boolean
  isFeeding: boolean
  isHealing: boolean
  isUsingItem: boolean
}

/**
 * Effets visuels pendant les actions
 */
export function ActionEffects({
  isSleeping,
  isPlaying,
  isFeeding,
  isHealing,
  isUsingItem,
}: ActionEffectsProps) {
  if (isSleeping) {
    return (
      <div className="absolute -top-4 -right-2 font-pixel text-[28px] text-indigo-600 drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">
        <span className="absolute animate-zzz">Z</span>
        <span className="absolute animate-zzz-delay-1">Z</span>
        <span className="absolute animate-zzz-delay-2">Z</span>
      </div>
    )
  }

  if (isPlaying) {
    return (
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[28px] text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        <span className="absolute -left-10 animate-sparkle">✦</span>
        <span className="absolute animate-sparkle-delay-1">★</span>
        <span className="absolute left-10 animate-sparkle-delay-2">✦</span>
      </div>
    )
  }

  if (isFeeding) {
    return (
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[32px] drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        <span className="absolute -left-10 animate-sparkle">🍖</span>
        <span className="absolute animate-sparkle-delay-1">🍕</span>
        <span className="absolute left-10 animate-sparkle-delay-2">🍎</span>
      </div>
    )
  }

  if (isHealing) {
    return (
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-pixel text-[32px] text-green-400 drop-shadow-[2px_2px_0_rgba(0,100,0,0.8)]">
        <span className="absolute -left-8 animate-heal-cross">+</span>
        <span className="absolute left-8 animate-heal-cross-delay-1">+</span>
      </div>
    )
  }

  if (isUsingItem) {
    return (
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[32px] drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        <span className="absolute -left-10 animate-sparkle">✨</span>
        <span className="absolute animate-sparkle-delay-1">🎁</span>
        <span className="absolute left-10 animate-sparkle-delay-2">✨</span>
      </div>
    )
  }

  return null
}