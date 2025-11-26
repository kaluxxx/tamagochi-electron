import type { Animal } from '../types'

/**
 * Calcule l'âge formaté d'un animal en heures ou jours
 */
export function formatAge(ageInHours: number): string {
  if (ageInHours < 24) {
    return `${Math.floor(ageInHours)}h`
  }
  const days = Math.floor(ageInHours / 24)
  return `${days}j`
}

/**
 * Détermine le mood du sprite en fonction des stats
 */
export function getMoodFromStats(animal: Animal): 'happy' | 'neutral' | 'sad' | 'hungry' | 'sleeping' | 'dead' {
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
export function getTypeColor(typeName: string): string {
  const colors: Record<string, string> = {
    cat: 'border-[#FF8C42]',
    dog: 'border-[#D4A574]',
    alien: 'border-[#7DCEA0]',
  }
  return colors[typeName] || 'border-border'
}