import { describe, it, expect } from 'vitest'
import { prismaMock } from './setup'
import { walletController, ECONOMY_CONFIG } from '../features/economy/controllers'
import { InsufficientFundsError } from '../core/errors'

describe('WalletController', () => {
  const mockWallet = {
    id: 'wallet-1',
    coins: 100,
    lastPassiveGain: new Date('2024-01-01T10:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z')
  }

  describe('getWallet', () => {
    it('should return existing wallet', async () => {
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)

      const result = await walletController.getWallet()

      expect(result).toEqual(mockWallet)
      expect(prismaMock.wallet.findFirst).toHaveBeenCalled()
    })

    it('should create wallet if none exists', async () => {
      prismaMock.wallet.findFirst.mockResolvedValue(null)
      prismaMock.wallet.create.mockResolvedValue(mockWallet)

      const result = await walletController.getWallet()

      expect(result).toEqual(mockWallet)
      expect(prismaMock.wallet.create).toHaveBeenCalledWith({
        data: {
          coins: 100,
          lastPassiveGain: expect.any(Date)
        }
      })
    })
  })

  describe('collectPassiveGains', () => {
    it('should add coins based on hours elapsed', async () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      const walletWithOldTimestamp = {
        ...mockWallet,
        lastPassiveGain: twoHoursAgo
      }
      const updatedWallet = {
        ...mockWallet,
        coins: 100 + 2 * ECONOMY_CONFIG.passiveGainRate,
        lastPassiveGain: new Date()
      }

      prismaMock.wallet.findFirst.mockResolvedValue(walletWithOldTimestamp)
      prismaMock.wallet.update.mockResolvedValue(updatedWallet)

      const result = await walletController.collectPassiveGains()

      expect(prismaMock.wallet.update).toHaveBeenCalled()
      expect(result.coins).toBeGreaterThan(mockWallet.coins)
    })

    it('should not add coins if very little time elapsed', async () => {
      // 5 minutes ago - should earn 0 coins (5/60 * 10 = 0.83, floor = 0)
      const recentTimestamp = new Date(Date.now() - 5 * 60 * 1000)
      const recentWallet = {
        ...mockWallet,
        lastPassiveGain: recentTimestamp
      }

      prismaMock.wallet.findFirst.mockResolvedValue(recentWallet)

      const result = await walletController.collectPassiveGains()

      expect(result.id).toBe(recentWallet.id)
      expect(result.coins).toBe(recentWallet.coins)
      expect(prismaMock.wallet.update).not.toHaveBeenCalled()
    })
  })

  describe('addCoins', () => {
    it('should add coins to wallet', async () => {
      const updatedWallet = { ...mockWallet, coins: 150 }
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.wallet.update.mockResolvedValue(updatedWallet)

      const result = await walletController.addCoins(50)

      expect(result.coins).toBe(150)
      expect(prismaMock.wallet.update).toHaveBeenCalledWith({
        where: { id: mockWallet.id },
        data: { coins: { increment: 50 } }
      })
    })
  })

  describe('spendCoins', () => {
    it('should deduct coins when sufficient balance', async () => {
      const updatedWallet = { ...mockWallet, coins: 50 }
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)
      prismaMock.wallet.update.mockResolvedValue(updatedWallet)

      const result = await walletController.spendCoins(50)

      expect(result.coins).toBe(50)
    })

    it('should throw InsufficientFundsError when insufficient balance', async () => {
      prismaMock.wallet.findFirst.mockResolvedValue(mockWallet)

      await expect(walletController.spendCoins(200)).rejects.toThrow(InsufficientFundsError)
    })
  })

  describe('getActionReward', () => {
    it('should return correct reward for feed action', () => {
      expect(walletController.getActionReward('feed')).toBe(ECONOMY_CONFIG.actionRewards.feed)
    })

    it('should return 0 for unknown action', () => {
      expect(walletController.getActionReward('unknown')).toBe(0)
    })
  })
})
