import { SpriteImage } from '@/shared/components/ui/sprite-image'
import { getAnimalSprite, calculateMood } from '@/shared/utils/sprite-loader'
import { cn } from '@/shared/lib/utils'
import type { Animal } from '../types'
import type { ActiveAction } from '../hooks/use-animal-actions'

interface GameZoneProps {
  animal: Animal
  activeAction: ActiveAction
  isSleeping: boolean
  sleepProgress: number
  isPlaying: boolean
  playProgress: number
  isFeeding: boolean
  feedProgress: number
  isHealing: boolean
  healProgress: number
  isUsingItem: boolean
  useItemProgress: number
}

// Fonction pour déterminer l'animation selon l'état
function getAnimationClass(
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

export function AnimalView({
  animal,
  activeAction,
  isSleeping,
  sleepProgress,
  isPlaying,
  playProgress,
  isFeeding,
  feedProgress,
  isHealing,
  healProgress,
  isUsingItem,
  useItemProgress,
}: GameZoneProps) {
  const mood = animal.isAlive ? calculateMood(animal, activeAction) : 'dead'
  const sprite = getAnimalSprite(animal.type.name, mood)

  // Pas d'action en cours
  const noActionInProgress = !isSleeping && !isPlaying && !isFeeding && !isHealing && !isUsingItem

  // Alertes pour stats basses (pas pendant une action)
  const lowStats: string[] = []
  if (noActionInProgress) {
    if (animal.hunger < 30) lowStats.push('Faim')
    if (animal.happiness < 30) lowStats.push('Bonheur')
    if (animal.energy < 30) lowStats.push('Énergie')
    if (animal.health < 30) lowStats.push('Santé')
  }

  const animationClass = getAnimationClass(animal.isAlive, mood, isSleeping, isPlaying, isFeeding, isHealing, isUsingItem)

  return (
    <div className="flex-1 flex flex-col">
      <div
        className="flex-1 border-4 border-black pixel-panel relative overflow-hidden flex items-center justify-center"
        style={{ backgroundImage: "url('/sprites/ui/background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Animal Sprite - animation selon l'état */}
        <div className="relative">
          <div className={cn('transition-transform duration-300', animationClass)}>
            <SpriteImage
              src={sprite}
              alt={animal.name}
              pixelated
              className="w-48 h-48"
            />
          </div>

          {/* ZZZ flottants pendant le sommeil */}
          {isSleeping && (
            <div className="absolute -top-4 -right-2 font-pixel text-[28px] text-indigo-600 drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">
              <span className="absolute animate-zzz">Z</span>
              <span className="absolute animate-zzz-delay-1">Z</span>
              <span className="absolute animate-zzz-delay-2">Z</span>
            </div>
          )}

          {/* Étoiles pendant le jeu */}
          {isPlaying && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[28px] text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
              <span className="absolute -left-10 animate-sparkle">✦</span>
              <span className="absolute animate-sparkle-delay-1">★</span>
              <span className="absolute left-10 animate-sparkle-delay-2">✦</span>
            </div>
          )}

          {/* Particules nourriture pendant feed */}
          {isFeeding && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[32px] drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
              <span className="absolute -left-10 animate-sparkle">🍖</span>
              <span className="absolute animate-sparkle-delay-1">🍕</span>
              <span className="absolute left-10 animate-sparkle-delay-2">🍎</span>
            </div>
          )}

          {/* Croix de soin pendant le heal */}
          {isHealing && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-pixel text-[32px] text-green-400 drop-shadow-[2px_2px_0_rgba(0,100,0,0.8)]">
              <span className="absolute -left-8 animate-heal-cross">+</span>
              <span className="absolute left-8 animate-heal-cross-delay-1">+</span>
            </div>
          )}

          {/* Particules utilisation d'item */}
          {isUsingItem && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[32px] drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
              <span className="absolute -left-10 animate-sparkle">✨</span>
              <span className="absolute animate-sparkle-delay-1">🎁</span>
              <span className="absolute left-10 animate-sparkle-delay-2">✨</span>
            </div>
          )}

          {/* Coeurs quand happy (et pas d'action en cours) */}
          {animal.isAlive && mood === 'happy' && noActionInProgress && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[36px] text-pink-500 drop-shadow-[3px_3px_0_rgba(0,0,0,0.5)]">
              <span className="absolute -left-12 animate-heart">♥</span>
              <span className="absolute animate-heart-delay-1">♥</span>
              <span className="absolute left-12 animate-heart-delay-2">♥</span>
            </div>
          )}

          {/* Larmes quand sad (et pas d'action en cours) */}
          {animal.isAlive && mood === 'sad' && noActionInProgress && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[28px] text-blue-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.4)]">
              <span className="absolute -left-10 animate-tear">💧</span>
              <span className="absolute animate-tear-delay-1">💧</span>
              <span className="absolute left-10 animate-tear-delay-2">💧</span>
            </div>
          )}

          {/* Spirales quand sick (et pas d'action en cours) */}
          {animal.isAlive && mood === 'sick' && noActionInProgress && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[28px] drop-shadow-[2px_2px_0_rgba(0,0,0,0.4)]">
              <span className="absolute -left-10 animate-sick-spiral">💫</span>
              <span className="absolute animate-sick-spiral-delay-1">🤢</span>
              <span className="absolute left-10 animate-sick-spiral-delay-2">💫</span>
            </div>
          )}
        </div>

        {/* Indicateur de sommeil */}
        {isSleeping && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#FFF4E6] border-4 border-black px-4 py-2 pixel-panel">
            <p className="font-pixel text-[10px] text-black text-center mb-2">
              ZZZ... {Math.round(sleepProgress)}%
            </p>
            <div className="h-3 bg-gray-200 border-2 border-black w-32">
              <div
                className="h-full bg-[#87CEEB] transition-all duration-1000"
                style={{ width: `${sleepProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Indicateur de jeu */}
        {isPlaying && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#FFF4E6] border-4 border-black px-4 py-2 pixel-panel">
            <p className="font-pixel text-[10px] text-black text-center mb-2">
              JOUE! {Math.round(playProgress)}%
            </p>
            <div className="h-3 bg-gray-200 border-2 border-black w-32">
              <div
                className="h-full bg-[#FFD700] transition-all duration-1000"
                style={{ width: `${playProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Indicateur de nourriture */}
        {isFeeding && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#FFF4E6] border-4 border-black px-4 py-2 pixel-panel">
            <p className="font-pixel text-[10px] text-black text-center mb-2">
              MIAM! {Math.round(feedProgress)}%
            </p>
            <div className="h-3 bg-gray-200 border-2 border-black w-32">
              <div
                className="h-full bg-[#F39C12] transition-all duration-1000"
                style={{ width: `${feedProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Indicateur de soin */}
        {isHealing && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#FFF4E6] border-4 border-black px-4 py-2 pixel-panel">
            <p className="font-pixel text-[10px] text-black text-center mb-2">
              SOIN! {Math.round(healProgress)}%
            </p>
            <div className="h-3 bg-gray-200 border-2 border-black w-32">
              <div
                className="h-full bg-[#2ECC71] transition-all duration-1000"
                style={{ width: `${healProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Indicateur d'utilisation d'item */}
        {isUsingItem && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#FFF4E6] border-4 border-black px-4 py-2 pixel-panel">
            <p className="font-pixel text-[10px] text-black text-center mb-2">
              ITEM! {Math.round(useItemProgress)}%
            </p>
            <div className="h-3 bg-gray-200 border-2 border-black w-32">
              <div
                className="h-full bg-[#9B59B6] transition-all duration-1000"
                style={{ width: `${useItemProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Alertes stats basses */}
        {animal.isAlive && noActionInProgress && lowStats.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#FFF4E6] border-4 border-black px-4 py-2 pixel-panel">
            <p className="font-pixel text-[8px] text-red-600 text-center animate-pulse-notify">
              ATTENTION: {lowStats.join(', ')} BAS!
            </p>
          </div>
        )}

        {/* Message si mort */}
        {!animal.isAlive && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#FFF4E6] border-4 border-black px-8 py-6 pixel-panel">
            <p className="font-pixel text-[14px] text-red-600 text-center uppercase">
              {animal.name} EST DÉCÉDÉ
            </p>
            <p className="font-pixel text-[10px] text-gray-600 text-center mt-3">
              Repose en paix
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
