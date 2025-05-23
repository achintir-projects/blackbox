import prisma from './prisma'
import crypto from 'crypto'

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
    price: 102700.05,
    isForced: true
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 0,
    price: 2350.10,
    isForced: true
  },
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    balance: 0,
    price: 635.20,
    isForced: true
  }
]

export async function initUserWallet(userAddress: string | null = null, userPublicKey: string | null = null, userPrivateKey: string | null = null) {
  try {
    // Generate wallet keys if not provided
    const privateKey = userPrivateKey || crypto.randomBytes(32).toString('hex')
    const publicKey = userPublicKey || crypto.createHash('sha256').update(privateKey).digest('hex')
    const address = userAddress || '0x' + crypto.createHash('sha256').update(publicKey).digest('hex').slice(0, 40)
    
    console.log('Starting wallet initialization for address:', address)

    // Check if wallet already exists
    let wallet = await prisma.wallet.findUnique({
      where: { address }
    })

    // Create new wallet if it doesn't exist
    if (!wallet) {
      console.log('Wallet not found, creating new wallet for address:', address)
      wallet = await prisma.wallet.create({
        data: {
          address,
          publicKey,
          encryptedPrivateKey: privateKey // In a real app, this would be encrypted
        }
      })
      console.log('Wallet created:', wallet)
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

    console.log('Initialized user wallet with zero-balance tokens:', {
      wallet: {
        address: wallet.address,
        publicKey: wallet.publicKey
      },
      tokens
    })

    return { wallet, tokens }
  } catch (error) {
    console.error('Failed to initialize user wallet:', error)
    throw error
  }
}

export default initUserWallet
