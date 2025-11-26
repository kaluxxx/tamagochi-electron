import { useState, useEffect, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAnimals } from '@frontend/features/animals/hooks/use-animals'
import { AnimalTabs } from '@frontend/features/animals/components/animal-tabs'
import { GameView } from '@frontend/shared/layout/game-view.tsx'
import { CoinDisplay } from '@frontend/features/economy'
import { AudioControls } from '@frontend/features/audio'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  const { data: animals = [], isLoading, isError, error } = useAnimals()
  const navigate = useNavigate()
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null)

  // Calculer l'animal sélectionné par défaut
  const defaultAnimalId = useMemo(() => {
    if (animals.length === 0) return null
    const livingAnimal = animals.find(a => a.isAlive)
    return livingAnimal?.id || animals[0].id
  }, [animals])

  // L'ID effectif est soit la sélection manuelle, soit le défaut
  const effectiveSelectedId = selectedAnimalId ?? defaultAnimalId

  // Rediriger si aucun animal
  useEffect(() => {
    if (!isLoading && animals.length === 0) {
      navigate({ to: '/animals/create' })
    }
  }, [isLoading, animals, navigate])

  // État de chargement
  if (isLoading) {
    return (
      <main className="h-screen w-screen bg-[#FFE5EC] flex items-center justify-center">
        <div className="bg-[#FFF4E6] border-8 border-black p-8 pixel-panel">
          <p className="font-pixel text-black text-sm">CHARGEMENT...</p>
        </div>
      </main>
    )
  }

  // Erreur
  if (isError) {
    return (
      <main className="h-screen w-screen bg-[#FFE5EC] flex items-center justify-center">
        <div className="bg-[#FFF4E6] border-8 border-black p-8 pixel-panel">
          <p className="font-pixel text-[#FF6B6B] text-sm">ERREUR</p>
          <p className="font-pixel text-[8px] text-gray-600 mt-2">
            {error?.message || 'Une erreur est survenue'}
          </p>
        </div>
      </main>
    )
  }

  // Pas d'animaux (redirection en cours)
  if (animals.length === 0) {
    return null
  }

  const selectedAnimal = animals.find(a => a.id === effectiveSelectedId) || animals[0]

  return (
    <main className="h-screen w-screen bg-[#FFE5EC] flex flex-col p-4 overflow-hidden">
      {/* Barre d'onglets avec navigation et solde */}
      <div className="flex items-end justify-between">
        <AnimalTabs
          animals={animals}
          selectedAnimalId={selectedAnimal.id}
          onSelectAnimal={setSelectedAnimalId}
        />

        {/* Navigation économie + solde + audio */}
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => navigate({ to: '/shop' })}
            className="px-3 py-1.5 bg-[#98D8AA] border-2 border-black font-pixel text-[10px] uppercase hover:bg-[#7BC77E] active:translate-y-0.5 transition-all"
          >
            BOUTIQUE
          </button>
          <button
            onClick={() => navigate({ to: '/minigames' })}
            className="px-3 py-1.5 bg-[#F4D35E] border-2 border-black font-pixel text-[10px] uppercase hover:bg-[#E5C04B] active:translate-y-0.5 transition-all"
          >
            JEUX
          </button>
          <CoinDisplay size="sm" />
          <AudioControls compact size="sm" />
        </div>
      </div>

      {/* Zone de jeu principale */}
      <div className="flex-1 bg-[#FFF4E6] border-4 border-black p-4 overflow-hidden">
        <GameView animal={selectedAnimal} />
      </div>
    </main>
  )
}
