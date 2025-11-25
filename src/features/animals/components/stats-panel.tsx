import { SpriteImage } from '@/shared/components/ui/sprite-image'
import { getStatSprite } from '@/shared/utils/sprite-loader'
import { cn } from '@/shared/lib/utils'
import type { Animal } from '../types'

interface StatsPanelProps {
  animal: Animal
  isSleeping: boolean
  isPlaying: boolean
}

interface StatBarProps {
  label: string
  value: number
  color: string
  icon: string
}

function StatBar({ label, value, color, icon }: StatBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SpriteImage src={icon} alt={label} className="w-4 h-4" pixelated />
          <span className="font-pixel text-[10px] text-black uppercase">{label}</span>
        </div>
        <span className="font-pixel text-[10px] text-black">{Math.round(value)}%</span>
      </div>
      <div className="h-3 bg-gray-200 border-2 border-black">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export function StatsPanel({ animal, isSleeping, isPlaying }: StatsPanelProps) {
  // Calculer l'âge en jours
  const ageInDays = Math.floor(animal.age / 24)

  // Déterminer le statut à afficher
  const getStatusText = () => {
    if (isPlaying) return 'JOUE...'
    if (isSleeping) return 'DORT...'
    if (animal.isAlive) return 'EN VIE'
    return 'DÉCÉDÉ'
  }

  const getStatusColor = () => {
    if (isPlaying) return 'text-yellow-600'
    if (isSleeping) return 'text-blue-600'
    if (animal.isAlive) return 'text-green-600'
    return 'text-red-600'
  }

  return (
    <div className="w-72 bg-[#FFF4E6] border-4 border-black pixel-panel p-4 flex flex-col">
      <div className="border-b-4 border-black pb-3 mb-4">
        <div className="flex items-center justify-center gap-2">
          <h2 className="font-pixel text-[12px] text-black text-center uppercase tracking-wider">
            {animal.name}
          </h2>
          {!animal.isAlive && (
            <SpriteImage
              src="/sprites/ui/dead-badge.svg"
              alt="Décédé"
              className="w-5 h-5"
              pixelated
            />
          )}
        </div>
        <p className="font-pixel text-[8px] text-gray-600 text-center mt-1">
          {animal.type.displayName}
        </p>
      </div>

      {/* Infos */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="font-pixel text-[8px] text-black">AGE</span>
          <span className="font-pixel text-[8px] text-black">{ageInDays} JOUR{ageInDays > 1 ? 'S' : ''}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-pixel text-[8px] text-black">STATUT</span>
          <span className={cn('font-pixel text-[8px]', getStatusColor())}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Stats Bars */}
      <div className="space-y-3 flex-1">
        <StatBar
          label="Santé"
          value={animal.health}
          color="#FF6B6B"
          icon={getStatSprite('health')}
        />
        <StatBar
          label="Faim"
          value={animal.hunger}
          color="#FFA500"
          icon={getStatSprite('hunger')}
        />
        <StatBar
          label="Bonheur"
          value={animal.happiness}
          color="#FFD700"
          icon={getStatSprite('happiness')}
        />
        <StatBar
          label="Énergie"
          value={animal.energy}
          color="#87CEEB"
          icon={getStatSprite('energy')}
        />
      </div>
    </div>
  )
}
