import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/shared/components/ui/sonner'
import { useBackgroundMusic, AudioControls } from '@/features/audio'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  // Initialize and manage background music based on route
  useBackgroundMusic()

  return (
    <div className="min-h-screen relative">
      {/* Audio controls in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <AudioControls compact />
      </div>
      <Outlet />
      <Toaster />
    </div>
  )
}
