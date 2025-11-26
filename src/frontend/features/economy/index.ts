// Components
export { CoinDisplay } from './components/coin-display'

// Hooks
export { useWallet } from './hooks/use-wallet'
export { useShop } from './hooks/use-shop'
export { useClickerUpgrades, CLICKER_UPGRADE_CONFIG, calculateUpgradeCost, calculateUpgradeEffect } from './hooks/use-clicker-upgrades'

// Services
export { economyApi } from './services/economy-api'

// Types
export type {
  Wallet,
  ShopItem,
  PurchaseResult,
  MinigameScore,
  MinigameResult,
  ClickerUpgradeType,
  ClickerUpgrade,
  ClickerGameStats,
  PurchaseUpgradeResult,
} from './types'
