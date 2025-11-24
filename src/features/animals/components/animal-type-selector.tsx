import { Card, CardContent } from '@/shared/components/ui/card'
import { SpriteImage } from '@/shared/components/ui/sprite-image'
import { getAnimalSprite } from '@/shared/utils/sprite-loader'
import { cn } from '@/shared/lib/utils'
import type { AnimalType } from '../types'

interface AnimalTypeSelectorProps {
  animalTypes: AnimalType[]
  selectedTypeId?: string
  onSelectType: (typeId: string) => void
  error?: string
}

export function AnimalTypeSelector({
  animalTypes,
  selectedTypeId,
  onSelectType,
  error,
}: AnimalTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-text-primary">
        Choisis un type d'animal
      </label>
      <div className="grid grid-cols-3 gap-4">
        {animalTypes.map((type) => {
          const isSelected = selectedTypeId === type.id
          const sprite = getAnimalSprite(type.name, 'neutral')

          return (
            <Card
              key={type.id}
              className={cn(
                'cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                'border-4',
                isSelected
                  ? 'border-primary-pink shadow-lg scale-105'
                  : 'border-border hover:border-primary-pink/50'
              )}
              onClick={() => onSelectType(type.id)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                <SpriteImage
                  src={sprite}
                  alt={type.displayName}
                  size="xl"
                  pixelated
                  className="w-24 h-24"
                />
                <div className="text-center">
                  <p className="font-bold text-base text-text-primary mt-1">
                    {type.displayName}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {error && (
        <p className="text-danger-red text-sm font-semibold mt-2">{error}</p>
      )}
    </div>
  )
}
