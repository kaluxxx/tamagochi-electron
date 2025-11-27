import type { Wallet } from '@/generated/prisma'
import { SingletonRepository } from '../../../core/base.repository'

export interface WalletUpdateInput {
  coins?: number
  coinsIncrement?: number
  coinsDecrement?: number
  lastPassiveGain?: Date
}

export class WalletRepository extends SingletonRepository<Wallet, WalletUpdateInput> {
  private static instance: WalletRepository

  private constructor() {
    super()
  }

  static getInstance(): WalletRepository {
    if (!WalletRepository.instance) {
      WalletRepository.instance = new WalletRepository()
    }
    return WalletRepository.instance
  }

  async get(): Promise<Wallet> {
    let wallet = await this.prisma.wallet.findFirst()

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          coins: 100,
          lastPassiveGain: new Date()
        }
      })
    }

    return wallet
  }

  async update(data: WalletUpdateInput): Promise<Wallet> {
    const wallet = await this.get()

    return this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        coins: data.coins,
        lastPassiveGain: data.lastPassiveGain,
        ...(data.coinsIncrement !== undefined && { coins: { increment: data.coinsIncrement } }),
        ...(data.coinsDecrement !== undefined && { coins: { decrement: data.coinsDecrement } })
      }
    })
  }

  async addCoins(amount: number): Promise<Wallet> {
    const wallet = await this.get()

    return this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { increment: amount } }
    })
  }

  async deductCoins(amount: number): Promise<Wallet> {
    const wallet = await this.get()

    return this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { decrement: amount } }
    })
  }

  async updateLastPassiveGain(date: Date): Promise<Wallet> {
    const wallet = await this.get()

    return this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { lastPassiveGain: date }
    })
  }
}

export const walletRepository = WalletRepository.getInstance()
