import { Card, CardContent } from '@/shared/components/ui/card'
import { SpriteImage } from '@/shared/components/ui/sprite-image'
import { getAnimalSprite, getStatSprite } from '@/shared/utils/sprite-loader'
import { cn } from '@/shared/lib/utils'
import type { Animal } from '../types'

interface AnimalCardProps {
  animal: Animal
  onClick?: () => void
}

/**
 * Calcule l'âge formaté d'un animal en heures ou jours
 */
function formatAge(ageInHours: number): string {
  if (ageInHours < 24) {
    return `${Math.floor(ageInHours)}h`
  }
  const days = Math.floor(ageInHours / 24)
  return `${days}j`
}

/**
 * Détermine le mood du sprite en fonction des stats
 */
function getMoodFromStats(animal: Animal): 'happy' | 'neutral' | 'sad' | 'hungry' | 'sleeping' | 'dead' {
  if (!animal.isAlive) return 'dead'

  if (animal.energy < 30) return 'sleeping'
  if (animal.hunger < 30) return 'hungry'
  if (animal.happiness < 30) return 'sad'
  if (animal.happiness > 60 && animal.hunger > 60) return 'happy'

  return 'neutral'
}

/**
 * Retourne la couleur de la bordure selon le type d'animal
 */
function getTypeColor(typeName: string): string {
  const colors: Record<string, string> = {
    cat: 'border-[#FF8C42]',
    dog: 'border-[#D4A574]',
    alien: 'border-[#7DCEA0]',
  }
  return colors[typeName] || 'border-border'
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
              className={cn(
                'w-20 h-20',
                !animal.isAlive && 'grayscale opacity-60'
              )}
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

/**
 * Item de stat avec sprite et barre de progression
 */
interface StatItemProps {
  icon: string
  value: number
  color: string
}

function StatItem({ icon, value, color }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <SpriteImage
        src={icon}
        alt="stat"
        size="sm"
        pixelated
        className="w-6 h-6 flex-shrink-0"
      />
      <div className="flex-1 space-y-1">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300">
          <div
            className={cn('h-full transition-all duration-500', color)}
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-text-secondary">
          {Math.floor(value)}/100
        </span>
      </div>
    </div>
  )
}