export function WaitingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="relative">
        <div className="text-6xl">🎣</div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-gray-400 to-transparent" />
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 animate-bob">
          <span className="text-2xl">🪝</span>
        </div>
      </div>
      <div className="text-xl font-pixel text-blue-300 mt-8">
        EN ATTENTE D'UN POISSON...
      </div>
      <div className="flex gap-1">
        <span className="animate-pulse delay-0">.</span>
        <span className="animate-pulse delay-100">.</span>
        <span className="animate-pulse delay-200">.</span>
      </div>
    </div>
  )
}
