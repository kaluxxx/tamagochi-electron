import { SpriteImage } from '@frontend/shared/ui/sprite-image'
import { getAnimalSprite, calculateMood, getUISprite } from '@frontend/shared/utils/sprite-loader'
import { cn } from '@frontend/shared/lib/utils'
import { getAnimationClass } from '../utils/animation-helpers'
import { ActionIndicator } from './action-indicator'
import { ActionEffects } from './action-effects'
import { MoodEffects } from './mood-effects'
import type { Animal } from '../types'
import type { ActiveAction } from '@frontend/features/actions/types'

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
        style={{ backgroundImage: `url('${getUISprite('background').replace('.svg', '.png')}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
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

          {/* Effets visuels pendant les actions */}
          <ActionEffects
            isSleeping={isSleeping}
            isPlaying={isPlaying}
            isFeeding={isFeeding}
            isHealing={isHealing}
            isUsingItem={isUsingItem}
          />

          {/* Effets visuels selon le mood (quand pas d'action en cours) */}
          {noActionInProgress && (
            <MoodEffects mood={mood} isAlive={animal.isAlive} />
          )}
        </div>

        {/* Indicateurs de progression des actions */}
        {isSleeping && (
          <ActionIndicator label="ZZZ..." progress={sleepProgress} color="bg-[#87CEEB]" />
        )}

        {isPlaying && (
          <ActionIndicator label="JOUE!" progress={playProgress} color="bg-[#FFD700]" />
        )}

        {isFeeding && (
          <ActionIndicator label="MIAM!" progress={feedProgress} color="bg-[#F39C12]" />
        )}

        {isHealing && (
          <ActionIndicator label="SOIN!" progress={healProgress} color="bg-[#2ECC71]" />
        )}

        {isUsingItem && (
          <ActionIndicator label="ITEM!" progress={useItemProgress} color="bg-[#9B59B6]" />
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
