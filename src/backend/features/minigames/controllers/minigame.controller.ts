import type { MinigameScore, ClickerUpgrade } from '@prisma/client'
import { minigameScoreRepository, clickerUpgradeRepository } from '../repositories'
import {
  CLICKER_UPGRADE_CONFIG,
  calculateUpgradeCost,
  calculateUpgradeEffect,
  type UpgradeType
} from '../repositories/clicker-upgrade.repository'
import { walletRepository } from '../../economy/repositories'
import { InsufficientFundsError } from '../../../core/errors'

export interface SaveScoreResult {
  score: MinigameScore
  wallet: { id: string; coins: number }
}

export interface PurchaseUpgradeResult {
  wallet: { id: string; coins: number }
  upgrade: ClickerUpgrade
  cost: number
}

export interface GameStats {
  multiplier: number
  gameDuration: number
  autoClicksPerSecond: number
}

export class MinigameController {
  private static instance: MinigameController

  private constructor() {}

  static getInstance(): MinigameController {
    if (!MinigameController.instance) {
      MinigameController.instance = new MinigameController()
    }
    return MinigameController.instance
  }

  async saveScore(gameType: string, score: number, coinsEarned: number): Promise<SaveScoreResult> {
    const wallet = await walletRepository.get()
    return minigameScoreRepository.saveScoreTransaction(
      { gameType, score, coinsEarned },
      wallet.id
    )
  }

  async getHighScores(gameType: string, limit = 10): Promise<MinigameScore[]> {
    return minigameScoreRepository.findHighScores(gameType, limit)
  }

  async getClickerUpgrades(): Promise<ClickerUpgrade[]> {
    return clickerUpgradeRepository.findAll()
  }

  async purchaseClickerUpgrade(type: UpgradeType): Promise<PurchaseUpgradeResult> {
    const upgrade = await clickerUpgradeRepository.findByType(type)
    const cost = calculateUpgradeCost(type, upgrade.level)
    const wallet = await walletRepository.get()

    if (wallet.coins < cost) {
      throw new InsufficientFundsError(cost, wallet.coins)
    }

    const result = await clickerUpgradeRepository.purchaseTransaction(type, cost, wallet.id)

    return {
      wallet: result.wallet,
      upgrade: result.upgrade,
      cost
    }
  }

  async getClickerGameStats(): Promise<GameStats> {
    const upgrades = await clickerUpgradeRepository.findAll()

    const getLevel = (upgradeType: UpgradeType) =>
      upgrades.find(u => u.type === upgradeType)?.level || 0

    return {
      multiplier: calculateUpgradeEffect('multiplier', getLevel('multiplier')),
      gameDuration: calculateUpgradeEffect('time_bonus', getLevel('time_bonus')),
      autoClicksPerSecond: calculateUpgradeEffect('auto_clicker', getLevel('auto_clicker'))
    }
  }
}

export const minigameController = MinigameController.getInstance()

// Re-export types and config for external use
export { CLICKER_UPGRADE_CONFIG, calculateUpgradeCost, calculateUpgradeEffect, type UpgradeType }
