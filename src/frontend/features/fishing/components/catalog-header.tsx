interface CatalogHeaderProps {
  totalCaught: number
  totalSpecies: number
  completionPercent: number
}

export function CatalogHeader({ totalCaught, totalSpecies, completionPercent }: CatalogHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-pixel text-blue-300">CATALOGUE</h2>
      <div className="flex items-center gap-3">
        <div className="text-sm font-pixel text-gray-400">
          {totalCaught}/{totalSpecies}
        </div>
        <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <div className="text-sm font-pixel text-cyan-400">{completionPercent}%</div>
      </div>
    </div>
  )
}