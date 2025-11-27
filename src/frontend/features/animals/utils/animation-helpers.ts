/**
 * Détermine la classe d'animation CSS selon l'état de l'animal
 */
export function getAnimationClass(
  isAlive: boolean,
  mood: string,
  isSleeping: boolean,
  isPlaying: boolean,
  isFeeding: boolean,
  isHealing: boolean,
  isUsingItem: boolean
): string {
  if (!isAlive) return 'animate-dead'
  if (isSleeping) return 'animate-sleeping'
  if (isPlaying) return 'animate-playing'
  if (isFeeding) return 'animate-eating'
  if (isHealing) return 'animate-healing'
  if (isUsingItem) return 'animate-eating' // Utilise la même animation que manger

  // Animation selon le mood quand pas d'action en cours
  switch (mood) {
    case 'happy':
      return 'animate-happy'
    case 'sad':
      return 'animate-sad'
    case 'sick':
      return 'animate-sick'
    default:
      return 'animate-happy' // default idle
  }
}