import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/shared/components/ui/button'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="font-pixel text-4xl text-text-primary mb-4">
          🎮 Tamagotchi
        </h1>
        <p className="font-sans text-lg text-text-secondary">
          Bienvenue dans ton Tamagotchi ! Crée ton premier animal virtuel et prends-en soin.
        </p>
        <Link to="/animals/create">
          <Button size="lg" className="mt-6">
            Créer mon premier animal
          </Button>
        </Link>
      </div>
    </div>
  )
}
