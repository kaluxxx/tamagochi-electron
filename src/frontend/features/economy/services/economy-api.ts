import type { Wallet, ShopItem, PurchaseResult, MinigameResult, MinigameScore, ClickerUpgrade, ClickerGameStats, PurchaseUpgradeResult, ClickerUpgradeType } from '../types'

export const economyApi = {
  // Wallet operations
  getWallet: async (): Promise<Wallet> => {
    return window.api.wallet.get()
  },

  collectPassiveGains: async (): Promise<Wallet> => {
    return window.api.wallet.collectPassive()
  },

  addCoins: async (amount: number): Promise<Wallet> => {
    return window.api.wallet.addCoins(amount)
  },

  // Shop operations
  getShopItems: async (): Promise<ShopItem[]> => {
    return window.api.shop.getItems()
  },

  purchaseItem: async (itemId: string, quantity: number = 1): Promise<PurchaseResult> => {
    return window.api.shop.purchase(itemId, quantity)
  },

  // Minigame operations
  saveMinigameScore: async (
    gameType: string,
    score: number,
    coinsEarned: number
  ): Promise<MinigameResult> => {
    return window.api.minigame.saveScore(gameType, score, coinsEarned)
  },

  getMinigameHighScores: async (gameType: string): Promise<MinigameScore[]> => {
    return window.api.minigame.getHighScores(gameType)
  },

  // Clicker Upgrades operations
  getClickerUpgrades: async (): Promise<ClickerUpgrade[]> => {
    return window.api.clickerUpgrades.getAll()
  },

  purchaseClickerUpgrade: async (type: ClickerUpgradeType): Promise<PurchaseUpgradeResult> => {
    return window.api.clickerUpgrades.purchase(type)
  },

  getClickerGameStats: async (): Promise<ClickerGameStats> => {
    return window.api.clickerUpgrades.getGameStats()
  },
}
