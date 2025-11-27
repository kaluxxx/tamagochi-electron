import { useState, useEffect } from 'react'
import { RouterProvider, createRouter, createHashHistory } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { LoadingScreen } from './shared/ui/loading-screen'
import { audioManager } from './features/audio/services/audio-manager'

// Use hash history for Electron file:// protocol compatibility
const hashHistory = createHashHistory()

// Create a new router instance
const router = createRouter({ routeTree, history: hashHistory })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Listen for app:ready event from main process
    const unsubscribeReady = window.api.onAppReady(() => {
      setIsReady(true)
    })

    // Listen for window visibility changes to mute/unmute audio
    const unsubscribeVisibility = window.api.onWindowVisibility((isVisible) => {
      audioManager.setGlobalMute(!isVisible)
    })

    return () => {
      unsubscribeReady()
      unsubscribeVisibility()
    }
  }, [])

  if (!isReady) {
    return <LoadingScreen />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
