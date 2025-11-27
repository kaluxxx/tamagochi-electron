import { ipcMain } from 'electron'
import { animalTypeController, animalController, actionController } from '../controllers'
import { validate, idSchema, createAnimalSchema, getHistorySchema } from '../../../core/validation'
import { serializeError } from '../../../core/errors'

function handleIpc<T>(handler: () => Promise<T>): Promise<T | ReturnType<typeof serializeError>> {
  return handler().catch((error) => {
    console.error('IPC Error:', error)
    return serializeError(error)
  })
}

export function registerAnimalsHandlers(): void {
  // ============== Animal Types ==============

  ipcMain.handle('animalTypes:getAll', async () => {
    return handleIpc(() => animalTypeController.getAllTypes())
  })

  ipcMain.handle('animalTypes:getById', async (_, id: unknown) => {
    return handleIpc(async () => {
      const validatedId = validate(idSchema, id)
      return animalTypeController.getTypeById(validatedId)
    })
  })

  // ============== Animals ==============

  ipcMain.handle('animals:getAll', async () => {
    return handleIpc(() => animalController.getAllAnimals())
  })

  ipcMain.handle('animals:getById', async (_, id: unknown) => {
    return handleIpc(async () => {
      const validatedId = validate(idSchema, id)
      return animalController.getAnimalById(validatedId)
    })
  })

  ipcMain.handle('animals:create', async (_, data: unknown) => {
    return handleIpc(async () => {
      const validated = validate(createAnimalSchema, data)
      return animalController.createAnimal(validated)
    })
  })

  ipcMain.handle('animals:tick', async (_, id: unknown) => {
    return handleIpc(async () => {
      const validatedId = validate(idSchema, id)
      return animalController.tickAnimal(validatedId)
    })
  })

  // ============== Animal Actions ==============

  ipcMain.handle('animals:feed', async (_, id: unknown) => {
    return handleIpc(async () => {
      const validatedId = validate(idSchema, id)
      return actionController.feedAnimal(validatedId)
    })
  })

  ipcMain.handle('animals:play', async (_, id: unknown) => {
    return handleIpc(async () => {
      const validatedId = validate(idSchema, id)
      return actionController.playWithAnimal(validatedId)
    })
  })

  ipcMain.handle('animals:heal', async (_, id: unknown) => {
    return handleIpc(async () => {
      const validatedId = validate(idSchema, id)
      return actionController.healAnimal(validatedId)
    })
  })

  ipcMain.handle('animals:sleep', async (_, id: unknown) => {
    return handleIpc(async () => {
      const validatedId = validate(idSchema, id)
      return actionController.sleepAnimal(validatedId)
    })
  })

  // ============== Action History ==============

  ipcMain.handle('actions:getByAnimalId', async (_, animalId: unknown) => {
    return handleIpc(async () => {
      const validatedId = validate(idSchema, animalId)
      return actionController.getActionsByAnimalId(validatedId)
    })
  })

  ipcMain.handle('history:getByAnimalId', async (_, animalId: unknown, limit?: unknown) => {
    return handleIpc(async () => {
      const validated = validate(getHistorySchema, { animalId, limit })
      return actionController.getActionHistory(validated.animalId, validated.limit)
    })
  })
}
