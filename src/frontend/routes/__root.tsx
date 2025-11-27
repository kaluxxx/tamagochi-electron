import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@frontend/shared/ui/sonner'
import { useBackgroundMusic } from '@frontend/features/audio'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  // Initialize and manage background music based on route
  useBackgroundMusic()

  return (
    <div className="min-h-screen">
      <Outlet />
      <Toaster />
    </div>
  )
}
