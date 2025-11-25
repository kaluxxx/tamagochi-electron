import { useActionHistory } from '../hooks/use-action-history'
import { HistoryEntry } from './history-entry'

interface HistoryPanelProps {
  animalId: string
}

export function HistoryPanel({ animalId }: HistoryPanelProps) {
  const { data: actions, isLoading } = useActionHistory(animalId)

  return (
    <div className="w-72 bg-[#FFF4E6] border-4 border-black pixel-panel p-4 flex flex-col flex-1 min-h-0">
      <div className="border-b-4 border-black pb-3 mb-4 shrink-0">
        <h2 className="font-pixel text-[12px] text-black text-center uppercase tracking-wider">
          Historique
        </h2>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-pixel text-[10px] text-gray-500">Chargement...</span>
        </div>
      ) : actions && actions.length > 0 ? (
        <div className="flex-1 overflow-y-auto p-1 pixel-scrollbar">
          {actions.map((action) => (
            <HistoryEntry key={action.id} action={action} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-pixel text-[10px] text-gray-500">Aucune action</span>
        </div>
      )}
    </div>
  )
}
