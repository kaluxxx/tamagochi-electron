import { Card, CardContent } from '@frontend/shared/ui/card'
import { SpriteImage } from '@frontend/shared/ui/sprite-image'
import { getAnimalSprite, getStatSprite } from '@frontend/shared/utils/sprite-loader'
import { cn } from '@frontend/shared/lib/utils'
import { StatItem } from './stat-item'
import { formatAge, getMoodFromStats, getTypeColor } from '../utils/animal-helpers'
import type { Animal } from '../types'

interface AnimalCardProps {
  animal: Animal
  onClick?: () => void
}

/**
 * Composant de carte pour afficher un animal individuel
 */
export function AnimalCard({ animal, onClick }: AnimalCardProps) {
  const mood = getMoodFromStats(animal)
  const sprite = getAnimalSprite(animal.type.name, mood)
  const typeColor = getTypeColor(animal.type.name)

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl',
        'border-4',
        animal.isAlive ? typeColor : 'border-gray-400 bg-gray-50',
        onClick && 'hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      <CardContent className="p-5 space-y-4">
        {/* En-tête : Sprite + Info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <SpriteImage
              src={sprite}
              alt={animal.name}
              size="xl"
              pixelated
              className="w-20 h-20"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-pixel text-base text-text-primary truncate mb-1">
              {animal.name}
            </h3>
            <p className="text-xs text-text-secondary font-semibold mb-2">
              {animal.type.displayName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-text-secondary font-semibold">
                Âge: {formatAge(animal.age)}
              </span>
              {!animal.isAlive && (
                <SpriteImage
                  src="/sprites/ui/dead-badge.svg"
                  alt="Décédé"
                  pixelated
                  className="w-6 h-6"
                />
              )}
            </div>
          </div>
        </div>

        {/* Stats avec sprites */}
        {animal.isAlive && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t-2 border-gray-100">
            <StatItem
              icon={getStatSprite('hunger')}
              value={animal.hunger}
              color="bg-warning-yellow"
            />
            <StatItem
              icon={getStatSprite('happiness')}
              value={animal.happiness}
              color="bg-primary-pink"
            />
            <StatItem
              icon={getStatSprite('health')}
              value={animal.health}
              color="bg-danger-red"
            />
            <StatItem
              icon={getStatSprite('energy')}
              value={animal.energy}
              color="bg-info-blue"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
