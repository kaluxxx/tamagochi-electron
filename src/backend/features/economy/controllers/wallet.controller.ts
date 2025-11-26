import type { Wallet } from '@prisma/client'
import { walletRepository } from '../repositories'
import { InsufficientFundsError } from '../../../core/errors'

export const ECONOMY_CONFIG = {
  passiveGainRate: 10, // Coins per hour
  actionRewards: {
    feed: 2,
    play: 5,
    heal: 3,
    sleep: 8,
    use_item: 1
  } as Record<string, number>
}

export class WalletController {
  private static instance: WalletController

  private constructor() {}

  static getInstance(): WalletController {
    if (!WalletController.instance) {
      WalletController.instance = new WalletController()
    }
    return WalletController.instance
  }

  async getWallet(): Promise<Wallet> {
    return walletRepository.get()
  }

  async collectPassiveGains(): Promise<Wallet> {
    const wallet = await walletRepository.get()

    const now = new Date()
    const hoursElapsed = (now.getTime() - wallet.lastPassiveGain.getTime()) / (1000 * 60 * 60)
    const coinsEarned = Math.floor(hoursElapsed * ECONOMY_CONFIG.passiveGainRate)

    if (coinsEarned > 0) {
      const updatedWallet = await walletRepository.addCoins(coinsEarned)
      await walletRepository.updateLastPassiveGain(now)
      return updatedWallet
    }

    return wallet
  }

  async addCoins(amount: number): Promise<Wallet> {
    return walletRepository.addCoins(amount)
  }

  async spendCoins(amount: number): Promise<Wallet> {
    const wallet = await walletRepository.get()

    if (wallet.coins < amount) {
      throw new InsufficientFundsError(amount, wallet.coins)
    }

    return walletRepository.deductCoins(amount)
  }

  getActionReward(actionType: string): number {
    return ECONOMY_CONFIG.actionRewards[actionType] || 0
  }
}

export const walletController = WalletController.getInstance()
