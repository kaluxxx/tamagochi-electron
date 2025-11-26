import { ipcMain } from 'electron'
import { itemController, inventoryController } from '../controllers'
import { validate, idSchema, useItemSchema } from '../../../core/validation'
import { serializeError } from '../../../core/errors'

function handleIpc<T>(handler: () => Promise<T>): Promise<T | ReturnType<typeof serializeError>> {
  return handler().catch((error) => {
    console.error('IPC Error:', error)
    return serializeError(error)
  })
}

export function registerInventoryHandlers(): void {
  // ============== Items ==============

  ipcMain.handle('items:getAll', async () => {
    return handleIpc(() => itemController.getAllItems())
  })

  ipcMain.handle('items:getById', async (_, id: unknown) => {
    return handleIpc(async () => {
      const validatedId = validate(idSchema, id)
      return itemController.getItemById(validatedId)
    })
  })

  ipcMain.handle('items:getByType', async (_, type: unknown) => {
    return handleIpc(async () => {
      const validatedType = validate(idSchema, type)
      return itemController.getItemsByType(validatedType)
    })
  })

  // ============== Inventory ==============

  ipcMain.handle('inventory:getAll', async () => {
    return handleIpc(() => inventoryController.getInventory())
  })

  ipcMain.handle('inventory:getByType', async (_, type: unknown) => {
    return handleIpc(async () => {
      const validatedType = validate(idSchema, type)
      return inventoryController.getInventoryByType(validatedType)
    })
  })

  // ============== Use Item ==============

  ipcMain.handle('items:useItem', async (_, animalId: unknown, itemId: unknown) => {
    return handleIpc(async () => {
      const validated = validate(useItemSchema, { animalId, itemId })
      return inventoryController.useItem(validated.animalId, validated.itemId)
    })
  })
}
