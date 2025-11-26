import type { ActionWithDelta } from '../types'

export const historyApi = {
  getByAnimalId: async (animalId: string, limit?: number): Promise<ActionWithDelta[]> => {
    return window.api.history.getByAnimalId(animalId, limit)
  }
}
