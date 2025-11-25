// Database
export { initializeDatabase, closeDatabase } from '@/electron/database/prisma'

// Animals
export {
  getAllAnimalTypes,
  getAnimalTypeById,
  getAllAnimals,
  getAnimalById,
  createAnimal,
  tickAnimal
} from './animals.service'
export type { TickResult } from './animals.service'

// Actions
export {
  feedAnimal,
  playWithAnimal,
  healAnimal,
  sleepAnimal,
  getActionsByAnimalId,
  recordAction,
  getActionHistory
} from './actions.service'

// Inventory
export {
  getAllItems,
  getItemById,
  getItemsByType,
  getInventory,
  getInventoryByType,
  useItem
} from './inventory.service'

// Economy
export {
  getWallet,
  collectPassiveGains,
  addCoins,
  spendCoins,
  getActionReward,
  getShopItems,
  purchaseItem
} from './economy.service'

// Minigames
export {
  saveMinigameScore,
  getMinigameHighScores,
  getClickerUpgrades,
  getClickerUpgradeByType,
  purchaseClickerUpgrade,
  getClickerGameStats,
  calculateUpgradeCost,
  calculateUpgradeEffect,
  CLICKER_UPGRADE_CONFIG
} from './minigames.service'
export type { UpgradeType } from './minigames.service'
