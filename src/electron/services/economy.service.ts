import { getPrismaClient } from '../database/prisma'

// ============== ECONOMY CONFIGURATION ==============

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

// ============== WALLET OPERATIONS ==============

export const getWallet = async () => {
  const prisma = getPrismaClient()
  let wallet = await prisma.wallet.findFirst()

  // Create wallet if it doesn't exist
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        coins: 100,
        lastPassiveGain: new Date()
      }
    })
  }

  return wallet
}

export const collectPassiveGains = async () => {
  const prisma = getPrismaClient()
  const wallet = await getWallet()

  const now = new Date()
  const hoursElapsed = (now.getTime() - wallet.lastPassiveGain.getTime()) / (1000 * 60 * 60)
  const coinsEarned = Math.floor(hoursElapsed * ECONOMY_CONFIG.passiveGainRate)

  if (coinsEarned > 0) {
    return prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        coins: { increment: coinsEarned },
        lastPassiveGain: now
      }
    })
  }

  return wallet
}

export const addCoins = async (amount: number) => {
  const wallet = await getWallet()
  return getPrismaClient().wallet.update({
    where: { id: wallet.id },
    data: { coins: { increment: amount } }
  })
}

export const spendCoins = async (amount: number) => {
  const wallet = await getWallet()
  if (wallet.coins < amount) {
    throw new Error('INSUFFICIENT_FUNDS')
  }
  return getPrismaClient().wallet.update({
    where: { id: wallet.id },
    data: { coins: { decrement: amount } }
  })
}

export const getActionReward = (actionType: string): number => {
  return ECONOMY_CONFIG.actionRewards[actionType] || 0
}

// ============== SHOP OPERATIONS ==============

export const getShopItems = async () => {
  return getPrismaClient().item.findMany({
    orderBy: [{ type: 'asc' }, { price: 'asc' }]
  })
}

export const purchaseItem = async (itemId: string, quantity: number = 1) => {
  const prisma = getPrismaClient()
  const item = await prisma.item.findUnique({ where: { id: itemId } })
  if (!item) throw new Error('Item not found')

  const totalCost = item.price * quantity
  const wallet = await getWallet()

  if (wallet.coins < totalCost) {
    throw new Error('INSUFFICIENT_FUNDS')
  }

  // Transaction: deduct coins + add to inventory
  const [updatedWallet, updatedInventory] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { coins: { decrement: totalCost } }
    }),
    prisma.inventory.upsert({
      where: { itemId },
      update: { quantity: { increment: quantity } },
      create: { itemId, quantity },
      include: { item: true }
    })
  ])

  return { wallet: updatedWallet, inventory: updatedInventory, item }
}
