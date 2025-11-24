import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/shared/components/ui/sonner'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen bg-bg-light">
      <Outlet />
      <Toaster />
    </div>
  )
}
