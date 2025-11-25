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
}

export function GameZone({
  animal,
  activeAction,
  isSleeping,
  sleepProgress,
  isPlaying,
  playProgress,
}: GameZoneProps) {
  const mood = animal.isAlive ? calculateMood(animal, activeAction) : 'dead'
  const sprite = getAnimalSprite(animal.type.name, mood)

  // Alertes pour stats basses (pas pendant le sommeil ou le jeu)
  const lowStats: string[] = []
  if (!isSleeping && !isPlaying) {
    if (animal.hunger < 30) lowStats.push('Faim')
    if (animal.happiness < 30) lowStats.push('Bonheur')
    if (animal.energy < 30) lowStats.push('Énergie')
    if (animal.health < 30) lowStats.push('Santé')
  }

  return (
    <div className="flex-1 flex flex-col">
      <div
        className="flex-1 rounded-3xl border-8 border-black relative overflow-hidden flex items-center justify-center"
        style={{ backgroundImage: "url('/sprites/ui/background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Animal Sprite - animation selon l'état */}
        <div className={cn(
          'transition-transform duration-300',
          animal.isAlive && !isSleeping && 'animate-bounce'
        )}>
          <SpriteImage
            src={sprite}
            alt={animal.name}
            pixelated
            className="w-48 h-48"
          />
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

        {/* Alertes stats basses */}
        {animal.isAlive && !isSleeping && !isPlaying && lowStats.length > 0 && (
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
