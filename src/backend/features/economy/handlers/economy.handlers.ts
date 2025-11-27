import { ipcMain } from 'electron'
import { walletController } from '../controllers'
import { shopController } from '../controllers'
import { validate, idSchema, addCoinsSchema, purchaseItemSchema } from '../../../core/validation'
import { serializeError } from '../../../core/errors'

/**
 * Wrapper for IPC handlers that provides:
 * - Error handling with serialization
 * - Consistent response format
 */
function handleIpc<T>(handler: () => Promise<T>): Promise<T | ReturnType<typeof serializeError>> {
  return handler().catch((error) => {
    console.error('IPC Error:', error)
    return serializeError(error)
  })
}

/**
 * Registers all economy-related IPC handlers
 */
export function registerEconomyHandlers(): void {
  // ============== Wallet Handlers ==============

  ipcMain.handle('wallet:get', async () => {
    return handleIpc(() => walletController.getWallet())
  })

  ipcMain.handle('wallet:collectPassive', async () => {
    return handleIpc(() => walletController.collectPassiveGains())
  })

  ipcMain.handle('wallet:addCoins', async (_, amount: unknown) => {
    return handleIpc(async () => {
      const validated = validate(addCoinsSchema, { amount })
      return walletController.addCoins(validated.amount)
    })
  })

  // ============== Shop Handlers ==============

  ipcMain.handle('shop:getItems', async () => {
    return handleIpc(() => shopController.getShopItems())
  })

  ipcMain.handle('shop:getItemById', async (_, id: unknown) => {
    return handleIpc(async () => {
      const validatedId = validate(idSchema, id)
      return shopController.getItemById(validatedId)
    })
  })

  ipcMain.handle('shop:getItemsByType', async (_, type: unknown) => {
    return handleIpc(async () => {
      const validatedType = validate(idSchema, type)
      return shopController.getItemsByType(validatedType)
    })
  })

  ipcMain.handle('shop:purchase', async (_, itemId: unknown, quantity: unknown) => {
    return handleIpc(async () => {
      const validated = validate(purchaseItemSchema, { itemId, quantity })
      return shopController.purchaseItem(validated.itemId, validated.quantity)
    })
  })
}
