import { useActionHistory } from '../hooks/use-action-history'
import { HistoryEntry } from './history-entry'

interface HistoryPanelProps {
  animalId: string
}

export function HistoryPanel({ animalId }: HistoryPanelProps) {
  const { data: actions, isLoading } = useActionHistory(animalId)

  return (
    <div className="flex flex-col flex-1 min-h-0">
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
