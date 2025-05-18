const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

const DEFAULT_TOKENS = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    balance: 1000000000,
    price: 1.00,
    isForced: true
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 100,
    price: 45000.00,
    isForced: true
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 1000,
    price: 3000.00,
    isForced: true
  },
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    balance: 5000,
    price: 300.00,
    isForced: true
  }
]

async function setupWallet() {
  try {
    // Clear existing data
    await prisma.tokenInjection.deleteMany()
    await prisma.token.deleteMany()
    await prisma.wallet.deleteMany()

    // Generate wallet keys
    const privateKey = crypto.randomBytes(32).toString('hex')
    const publicKey = crypto.createHash('sha256').update(privateKey).digest('hex')
    const address = '0x' + crypto.createHash('sha256').update(publicKey).digest('hex').slice(0, 40)
    
    // Create new wallet
    const wallet = await prisma.wallet.create({
      data: {
        address,
        publicKey,
        encryptedPrivateKey: privateKey // In a real app, this would be encrypted
      }
    })

    // Create default tokens
    const tokens = []
    const injections = []

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

        // Record the injection
        const injection = await prisma.tokenInjection.create({
          data: {
            tokenId: token.id,
            symbol: tokenData.symbol,
            amount: tokenData.balance,
            price: tokenData.price
          }
        })
        injections.push(injection)
      }
    }

    console.log('Created wallet with default tokens:', {
      wallet: {
        address: wallet.address,
        publicKey: wallet.publicKey,
        privateKey // In a real app, this would be encrypted and not logged
      },
      tokens,
      injections
    })
  } catch (error) {
    console.error('Failed to setup wallet:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupWallet()
