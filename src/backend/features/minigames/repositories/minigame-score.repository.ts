import type { MinigameScore } from '@prisma/client'
import { getPrismaClient } from '../../../database/prisma'

export interface MinigameScoreCreateInput {
  gameType: string
  score: number
  coinsEarned: number
}

export class MinigameScoreRepository {
  private static instance: MinigameScoreRepository

  private constructor() {}

  static getInstance(): MinigameScoreRepository {
    if (!MinigameScoreRepository.instance) {
      MinigameScoreRepository.instance = new MinigameScoreRepository()
    }
    return MinigameScoreRepository.instance
  }

  private get prisma() {
    return getPrismaClient()
  }

  async create(data: MinigameScoreCreateInput): Promise<MinigameScore> {
    return this.prisma.minigameScore.create({
      data: {
        gameType: data.gameType,
        score: data.score,
        coinsEarned: data.coinsEarned
      }
    })
  }

  async findHighScores(gameType: string, limit = 10): Promise<MinigameScore[]> {
    return this.prisma.minigameScore.findMany({
      where: { gameType },
      orderBy: { score: 'desc' },
      take: limit
    })
  }

  async saveScoreTransaction(
    data: MinigameScoreCreateInput,
    walletId: string
  ): Promise<{ score: MinigameScore; wallet: { id: string; coins: number } }> {
    const [savedScore, updatedWallet] = await this.prisma.$transaction([
      this.prisma.minigameScore.create({
        data: {
          gameType: data.gameType,
          score: data.score,
          coinsEarned: data.coinsEarned
        }
      }),
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { coins: { increment: data.coinsEarned } }
      })
    ])

    return { score: savedScore, wallet: updatedWallet }
  }
}

export const minigameScoreRepository = MinigameScoreRepository.getInstance()
