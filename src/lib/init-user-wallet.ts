import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

const DEFAULT_TOKENS = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    balance: 0,
    price: 1.00,
    isForced: true
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0,
    price: 45000.00,
    isForced: true
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 0,
    price: 3000.00,
    isForced: true
  },
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    balance: 0,
    price: 300.00,
    isForced: true
  }
]

export async function initUserWallet(userAddress: string, userPublicKey: string, userPrivateKey: string) {
  try {
    // Check if wallet already exists
    let wallet = await prisma.wallet.findUnique({
      where: { address: userAddress }
    })

    // Create new wallet if it doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          address: userAddress,
          publicKey: userPublicKey,
          encryptedPrivateKey: userPrivateKey // In a real app, this would be encrypted
        }
      })
    }

    // Create default tokens with zero balances
    const tokens = []
    for (const tokenData of DEFAULT_TOKENS) {
      // Check if token already exists for this wallet
      const existingToken = await prisma.token.findFirst({
        where: {
          walletId: wallet.id,
          symbol: tokenData.symbol
        }
      })

      if (!existingToken) {
        const token = await prisma.token.create({
          data: {
            ...tokenData,
            walletId: wallet.id
          }
        })
        tokens.push(token)
      }
    }

    return { wallet, tokens }
  } catch (error) {
    console.error('Failed to initialize user wallet:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
