// Database
export { initializeDatabase, closeDatabase } from '../database/prisma'

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

// Fishing
export {
  // Fish Species
  getAllFishSpecies,
  getFishSpeciesById,
  getFishSpeciesByName,
  // Catalog
  getCaughtFish,
  getCaughtSpeciesIds,
  isFirstCatch,
  // Catch
  catchFish,
  failCatch,
  selectRandomFish,
  // Rods
  getFishingRods,
  getEquippedRod,
  purchaseRod,
  equipRod,
  // Baits
  getFishingBaits,
  purchaseBait,
  // Locations
  getFishingLocations,
  unlockLocation,
  // Upgrades
  getFishingUpgrades,
  getFishingUpgradeByType,
  purchaseFishingUpgrade,
  getFishingStats,
  getFishingUpgradesWithDetails,
  calculateFishingUpgradeCost,
  calculateFishingUpgradeEffect,
  FISHING_UPGRADE_CONFIG,
  // Progress
  getFishingProgress,
} from './fishing.service'
export type { FishingUpgradeType } from './fishing.service'
