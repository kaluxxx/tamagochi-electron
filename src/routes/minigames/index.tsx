import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CoinDisplay } from '@/features/economy'
import { AudioControls } from '@/features/audio'

export const Route = createFileRoute('/minigames/')({
  component: MinigamesPage,
})

function MinigamesPage() {
  const navigate = useNavigate()

  return (
    <main className="h-screen w-screen bg-[#FFE5EC] flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate({ to: '/' })}
          className="px-3 py-1.5 bg-gray-200 border-2 border-black font-pixel text-[10px] uppercase hover:bg-gray-300 active:translate-y-0.5 transition-all"
        >
          RETOUR
        </button>
        <h1 className="font-pixel text-xl text-black">MINI-JEUX</h1>
        <div className="flex items-center gap-2">
          <CoinDisplay size="md" />
          <AudioControls compact size="md" />
        </div>
      </div>

      {/* Liste des jeux */}
      <div className="flex-1 bg-[#FFF4E6] border-4 border-black p-4 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Clicker Game */}
          <button
            onClick={() => navigate({ to: '/minigames/clicker' })}
            className="p-4 bg-[#F4D35E] border-4 border-black hover:bg-[#E5C04B] active:translate-y-1 transition-all"
          >
            <div className="text-4xl mb-2">&#x1F447;</div>
            <h2 className="font-pixel text-sm text-black mb-1">CLICKER</h2>
            <p className="font-pixel text-[8px] text-gray-700">
              Clique le plus vite possible !
            </p>
            <p className="font-pixel text-[8px] text-green-700 mt-2">
              Gain max: 30 pièces
            </p>
          </button>

          {/* Fishing Game */}
          <button
            onClick={() => navigate({ to: '/minigames/fishing' })}
            className="p-4 bg-[#5DADE2] border-4 border-black hover:bg-[#48A6D6] active:translate-y-1 transition-all"
          >
            <div className="text-4xl mb-2">&#x1F3A3;</div>
            <h2 className="font-pixel text-sm text-black mb-1">PECHE</h2>
            <p className="font-pixel text-[8px] text-gray-700">
              Attrape des poissons rares !
            </p>
            <p className="font-pixel text-[8px] text-green-700 mt-2">
              20 especes a collecter
            </p>
          </button>
        </div>
      </div>
    </main>
  )
}
