import { describe, it, expect } from 'vitest'
import { prismaMock } from './setup'
import { minigameController } from '../features/minigames/controllers'
import { InsufficientFundsError } from '../core/errors'

describe('MinigameController', () => {
  const mockWallet = {
    id: 'wallet-1',
    coins: 100,
    lastPassiveGain: new Date(),
    createdAt: new Date()
  }

  const mockScore = {
    id: 'score-1',
    gameType: 'clicker',
    score: 500,
    coinsEarned: 50,
    playedAt: new Date()
  }

  const mockUpgrade = {
    id: 'upgrade-1',
    type: 'multiplier',
    level: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  describe('saveScore', () => {
    it('should save score and add coins to wallet', async () => {
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.$transaction.mockResolvedValue([
        mockScore,
        { ...mockWallet, coins: 150 }
      ])

      const result = await minigameController.saveScore('clicker', 500, 50)

      expect(result.score.score).toBe(500)
      expect(result.wallet.coins).toBe(150)
    })
  })

  describe('getHighScores', () => {
    it('should return high scores for game type', async () => {
      prismaMock.minigameScore.findMany.mockResolvedValue([mockScore])

      const result = await minigameController.getHighScores('clicker')

      expect(result).toHaveLength(1)
      expect(result[0].score).toBe(500)
    })

    it('should limit results', async () => {
      const scores = Array(15).fill(mockScore)
      prismaMock.minigameScore.findMany.mockResolvedValue(scores.slice(0, 10))

      const result = await minigameController.getHighScores('clicker', 10)

      expect(result).toHaveLength(10)
    })
  })

  describe('getClickerUpgrades', () => {
    it('should return all clicker upgrades', async () => {
      const now = new Date()
      const upgrades = [
        { id: '1', type: 'multiplier', level: 1, createdAt: now, updatedAt: now },
        { id: '2', type: 'time_bonus', level: 0, createdAt: now, updatedAt: now },
        { id: '3', type: 'auto_clicker', level: 2, createdAt: now, updatedAt: now }
      ]
      prismaMock.clickerUpgrade.findUnique.mockResolvedValueOnce(upgrades[0])
      prismaMock.clickerUpgrade.findUnique.mockResolvedValueOnce(upgrades[1])
      prismaMock.clickerUpgrade.findUnique.mockResolvedValueOnce(upgrades[2])

      const result = await minigameController.getClickerUpgrades()

      expect(result).toHaveLength(3)
    })

    it('should create upgrade if not exists', async () => {
      const now = new Date()
      prismaMock.clickerUpgrade.findUnique.mockResolvedValue(null)
      prismaMock.clickerUpgrade.create.mockResolvedValue({ id: '1', type: 'multiplier', level: 0, createdAt: now, updatedAt: now })

      const result = await minigameController.getClickerUpgrades()

      expect(result).toHaveLength(3)
      expect(prismaMock.clickerUpgrade.create).toHaveBeenCalled()
    })
  })

  describe('purchaseClickerUpgrade', () => {
    it('should purchase upgrade successfully', async () => {
      const now = new Date()
      const level0Upgrade = { id: 'upgrade-1', type: 'multiplier', level: 0, createdAt: now, updatedAt: now }
      const updatedUpgrade = { ...level0Upgrade, level: 1 }
      const richWallet = { ...mockWallet, coins: 500 }

      prismaMock.clickerUpgrade.findUnique.mockResolvedValue(level0Upgrade)
      prismaMock.wallet.findFirst.mockResolvedValue(richWallet)
      prismaMock.$transaction.mockResolvedValue([
        { ...richWallet, coins: 450 },
        updatedUpgrade
      ])

      const result = await minigameController.purchaseClickerUpgrade('multiplier')

      expect(result.upgrade.level).toBe(1)
      expect(result.cost).toBeGreaterThan(0)
    })

    it('should throw InsufficientFundsError when not enough coins', async () => {
      const expensiveUpgrade = { ...mockUpgrade, level: 10 } // High level = expensive
      const poorWallet = { ...mockWallet, coins: 10 }

      prismaMock.clickerUpgrade.findUnique.mockResolvedValue(expensiveUpgrade)
      prismaMock.wallet.findFirst.mockResolvedValue(poorWallet)

      await expect(minigameController.purchaseClickerUpgrade('multiplier')).rejects.toThrow(InsufficientFundsError)
    })
  })

  describe('getClickerGameStats', () => {
    it('should return calculated game stats', async () => {
      const now = new Date()
      const upgrades = [
        { id: '1', type: 'multiplier', level: 2, createdAt: now, updatedAt: now },
        { id: '2', type: 'time_bonus', level: 1, createdAt: now, updatedAt: now },
        { id: '3', type: 'auto_clicker', level: 3, createdAt: now, updatedAt: now }
      ]
      prismaMock.clickerUpgrade.findUnique.mockResolvedValueOnce(upgrades[0])
      prismaMock.clickerUpgrade.findUnique.mockResolvedValueOnce(upgrades[1])
      prismaMock.clickerUpgrade.findUnique.mockResolvedValueOnce(upgrades[2])

      const result = await minigameController.getClickerGameStats()

      expect(result.multiplier).toBeGreaterThan(0)
      expect(result.gameDuration).toBeGreaterThan(0)
      expect(result.autoClicksPerSecond).toBeGreaterThanOrEqual(0)
    })
  })
})
