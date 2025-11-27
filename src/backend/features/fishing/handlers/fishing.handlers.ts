import { ipcMain } from 'electron'
import { fishingController, type FishingUpgradeType } from '../controllers'
import {
  validate,
  idSchema,
  selectRandomFishSchema,
  catchFishSchema,
  purchaseRodSchema,
  equipRodSchema,
  purchaseBaitSchema,
  unlockLocationSchema,
  purchaseFishingUpgradeSchema
} from '../../../core/validation'
import { serializeError } from '../../../core/errors'

function handleIpc<T>(handler: () => Promise<T>): Promise<T | ReturnType<typeof serializeError>> {
  return handler().catch((error) => {
    console.error('IPC Error:', error)
    return serializeError(error)
  })
}

export function registerFishingHandlers(
  notifyRenderer: (channel: string, data: unknown) => void
): void {
  // ============== Species ==============

  ipcMain.handle('fishing:getAllSpecies', async () => {
    return handleIpc(() => fishingController.getAllSpecies())
  })

  ipcMain.handle('fishing:getSpeciesById', async (_, id: unknown) => {
    return handleIpc(async () => {
      const validatedId = validate(idSchema, id)
      return fishingController.getSpeciesById(validatedId)
    })
  })

  // ============== Catalog ==============

  ipcMain.handle('fishing:getCaughtFish', async () => {
    return handleIpc(() => fishingController.getCaughtFish())
  })

  ipcMain.handle('fishing:getCaughtSpeciesIds', async () => {
    return handleIpc(() => fishingController.getCaughtSpeciesIds())
  })

  // ============== Game Actions ==============

  ipcMain.handle('fishing:selectRandomFish', async (_, locationId: unknown, baitId?: unknown) => {
    return handleIpc(async () => {
      const validated = validate(selectRandomFishSchema, { locationId, baitId })
      return fishingController.selectRandomFish(validated.locationId, validated.baitId)
    })
  })

  ipcMain.handle('fishing:catchFish', async (_, speciesId: unknown, size: unknown, locationId: unknown, rodId: unknown, baitId?: unknown) => {
    return handleIpc(async () => {
      const validated = validate(catchFishSchema, { speciesId, size, locationId, rodId, baitId })
      const result = await fishingController.catchFish(
        validated.speciesId,
        validated.size,
        validated.locationId,
        validated.rodId,
        validated.baitId
      )
      notifyRenderer('wallet:updated', result.wallet)
      return result
    })
  })

  ipcMain.handle('fishing:failCatch', async () => {
    return handleIpc(() => fishingController.failCatch())
  })

  // ============== Rods ==============

  ipcMain.handle('fishing:getRods', async () => {
    return handleIpc(() => fishingController.getRods())
  })

  ipcMain.handle('fishing:getEquippedRod', async () => {
    return handleIpc(() => fishingController.getEquippedRod())
  })

  ipcMain.handle('fishing:purchaseRod', async (_, rodId: unknown) => {
    return handleIpc(async () => {
      const validated = validate(purchaseRodSchema, { rodId })
      const result = await fishingController.purchaseRod(validated.rodId)
      notifyRenderer('wallet:updated', result.wallet)
      return result
    })
  })

  ipcMain.handle('fishing:equipRod', async (_, rodId: unknown) => {
    return handleIpc(async () => {
      const validated = validate(equipRodSchema, { rodId })
      return fishingController.equipRod(validated.rodId)
    })
  })

  // ============== Baits ==============

  ipcMain.handle('fishing:getBaits', async () => {
    return handleIpc(() => fishingController.getBaits())
  })

  ipcMain.handle('fishing:purchaseBait', async (_, baitId: unknown, quantity: unknown) => {
    return handleIpc(async () => {
      const validated = validate(purchaseBaitSchema, { baitId, quantity })
      const result = await fishingController.purchaseBait(validated.baitId, validated.quantity)
      notifyRenderer('wallet:updated', result.wallet)
      return result
    })
  })

  // ============== Locations ==============

  ipcMain.handle('fishing:getLocations', async () => {
    return handleIpc(() => fishingController.getLocations())
  })

  ipcMain.handle('fishing:unlockLocation', async (_, locationId: unknown) => {
    return handleIpc(async () => {
      const validated = validate(unlockLocationSchema, { locationId })
      const result = await fishingController.unlockLocation(validated.locationId)
      notifyRenderer('wallet:updated', result.wallet)
      return result
    })
  })

  // ============== Upgrades ==============

  ipcMain.handle('fishing:getUpgrades', async () => {
    return handleIpc(() => fishingController.getUpgrades())
  })

  ipcMain.handle('fishing:purchaseUpgrade', async (_, type: unknown) => {
    return handleIpc(async () => {
      const validated = validate(purchaseFishingUpgradeSchema, { type })
      const result = await fishingController.purchaseUpgrade(validated.type as FishingUpgradeType)
      notifyRenderer('wallet:updated', result.wallet)
      return result
    })
  })

  ipcMain.handle('fishing:getStats', async () => {
    return handleIpc(() => fishingController.getStats())
  })

  ipcMain.handle('fishing:getUpgradesWithDetails', async () => {
    return handleIpc(() => fishingController.getUpgradesWithDetails())
  })

  // ============== Progress ==============

  ipcMain.handle('fishing:getProgress', async () => {
    return handleIpc(() => fishingController.getProgress())
  })
}
