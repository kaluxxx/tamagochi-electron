import { useQuery } from '@tanstack/react-query'
import { historyApi } from '../services/history-api'
import type { ActionWithDelta } from '../types'

export function useActionHistory(animalId: string, limit = 20) {
  return useQuery<ActionWithDelta[]>({
    queryKey: ['history', animalId, limit],
    queryFn: () => historyApi.getByAnimalId(animalId, limit),
    enabled: !!animalId
  })
}
