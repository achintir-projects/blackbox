const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

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

    // Create USDT token
    const token = await prisma.token.create({
      data: {
        symbol: 'USDT',
        name: 'Tether USD',
        balance: 1000000000,
        price: 1.00,
        isForced: true,
        walletId: wallet.id
      }
    })

    // Record the injection
    const injection = await prisma.tokenInjection.create({
      data: {
        tokenId: token.id,
        symbol: 'USDT',
        amount: 1000000000,
        price: 1.00
      }
    })

    console.log('Created wallet with $1B USDT:', {
      wallet: {
        address: wallet.address,
        publicKey: wallet.publicKey,
        privateKey // In a real app, this would be encrypted and not logged
      },
      token,
      injection
    })
  } catch (error) {
    console.error('Failed to setup wallet:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupWallet()
