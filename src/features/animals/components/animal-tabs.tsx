import { useNavigate } from '@tanstack/react-router'
import { SpriteImage } from '@/shared/components/ui/sprite-image'
import { getAnimalSprite, calculateMood } from '@/shared/utils/sprite-loader'
import { cn } from '@/shared/lib/utils'
import type { Animal } from '../types'

interface AnimalTabsProps {
  animals: Animal[]
  selectedAnimalId: string
  onSelectAnimal: (id: string) => void
}

export function AnimalTabs({ animals, selectedAnimalId, onSelectAnimal }: AnimalTabsProps) {
  const navigate = useNavigate()

  // Séparer les animaux vivants des morts
  const livingAnimals = animals.filter(a => a.isAlive)
  const deadAnimals = animals.filter(a => !a.isAlive)

  return (
    <div className="flex items-end gap-0">
      {/* Onglets des animaux vivants */}
      {livingAnimals.map((animal) => {
        const isSelected = animal.id === selectedAnimalId
        const mood = calculateMood(animal)
        const sprite = getAnimalSprite(animal.type.name, mood)

        return (
          <button
            key={animal.id}
            onClick={() => onSelectAnimal(animal.id)}
            className={cn(
              'px-4 py-2 flex items-center gap-2 transition-all',
              'font-pixel text-[10px] uppercase',
              'border-t-4 border-l-4 border-r-4 border-b-0 border-black',
              isSelected
                ? 'bg-[#FFF4E6] text-black relative z-10 pb-3 -mb-[4px]'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            )}
          >
            <SpriteImage src={sprite} alt={animal.name} className="w-6 h-6" pixelated />
            <span className="max-w-[80px] truncate">{animal.name}</span>
          </button>
        )
      })}

      {/* Onglets des animaux morts (plus discrets) */}
      {deadAnimals.map((animal) => {
        const isSelected = animal.id === selectedAnimalId
        const sprite = getAnimalSprite(animal.type.name, 'dead')

        return (
          <button
            key={animal.id}
            onClick={() => onSelectAnimal(animal.id)}
            className={cn(
              'px-4 py-2 flex items-center gap-2 transition-all opacity-60',
              'font-pixel text-[10px] uppercase',
              'border-t-4 border-l-4 border-r-4 border-b-0 border-black',
              isSelected
                ? 'bg-[#FFF4E6] text-black relative z-10 pb-3 -mb-[4px]'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            )}
          >
            <SpriteImage src={sprite} alt={animal.name} className="w-6 h-6 grayscale" pixelated />
            <span className="max-w-[80px] truncate">{animal.name}</span>
          </button>
        )
      })}

      {/* Bouton Nouveau */}
      <button
        onClick={() => navigate({ to: '/animals/create' })}
        className={cn(
          'px-4 py-2 flex items-center gap-2 ml-2',
          'bg-[#87CEEB] border-t-4 border-l-4 border-r-4 border-b-0 border-black',
          'font-pixel text-[10px] text-black uppercase',
          'transition-all hover:bg-[#5DADE2] active:translate-y-1'
        )}
      >
        <span className="text-lg leading-none">+</span>
        <span>NOUVEAU</span>
      </button>
    </div>
  )
}
