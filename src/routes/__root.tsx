import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/shared/components/ui/sonner'
import { useBackgroundMusic } from '@/features/audio'

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
