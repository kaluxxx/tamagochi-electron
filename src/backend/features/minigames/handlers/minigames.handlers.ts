import { ipcMain } from 'electron'
import { minigameController, type UpgradeType } from '../controllers'
import { validate, idSchema, saveScoreSchema, purchaseClickerUpgradeSchema } from '../../../core/validation'
import { serializeError } from '../../../core/errors'

function handleIpc<T>(handler: () => Promise<T>): Promise<T | ReturnType<typeof serializeError>> {
  return handler().catch((error) => {
    console.error('IPC Error:', error)
    return serializeError(error)
  })
}

export function registerMinigamesHandlers(
  notifyRenderer: (channel: string, data: unknown) => void
): void {
  // ============== Minigame Scores ==============

  ipcMain.handle('minigame:saveScore', async (_, gameType: unknown, score: unknown, coinsEarned: unknown) => {
    return handleIpc(async () => {
      const validated = validate(saveScoreSchema, { gameType, score, coinsEarned })
      return minigameController.saveScore(
        validated.gameType,
        validated.score,
        validated.coinsEarned
      )
    })
  })

  ipcMain.handle('minigame:getHighScores', async (_, gameType: unknown) => {
    return handleIpc(async () => {
      const validatedGameType = validate(idSchema, gameType)
      return minigameController.getHighScores(validatedGameType)
    })
  })

  // ============== Clicker Upgrades ==============

  ipcMain.handle('clickerUpgrades:getAll', async () => {
    return handleIpc(() => minigameController.getClickerUpgrades())
  })

  ipcMain.handle('clickerUpgrades:purchase', async (_, type: unknown) => {
    return handleIpc(async () => {
      const validated = validate(purchaseClickerUpgradeSchema, { type })
      const result = await minigameController.purchaseClickerUpgrade(validated.type as UpgradeType)
      notifyRenderer('wallet:updated', result.wallet)
      return result
    })
  })

  ipcMain.handle('clickerUpgrades:getGameStats', async () => {
    return handleIpc(() => minigameController.getClickerGameStats())
  })
}
