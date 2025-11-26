interface ActionIndicatorProps {
  label: string
  progress: number
  color: string
}

/**
 * Indicateur de progression d'une action en cours
 */
export function ActionIndicator({ label, progress, color }: ActionIndicatorProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#FFF4E6] border-4 border-black px-4 py-2 pixel-panel">
      <p className="font-pixel text-[10px] text-black text-center mb-2">
        {label} {Math.round(progress)}%
      </p>
      <div className="h-3 bg-gray-200 border-2 border-black w-32">
        <div
          className={`h-full ${color} transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}