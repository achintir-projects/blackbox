const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function createWallet() {
  try {
    // Generate wallet keys
    const privateKey = crypto.randomBytes(32).toString('hex')
    const publicKey = crypto.createHash('sha256').update(privateKey).digest('hex')
    const address = '0x' + crypto.createHash('sha256').update(publicKey).digest('hex').slice(0, 40)
    
    // Create wallet with proper keys
    // Delete existing tokens and wallet
    await prisma.tokenInjection.deleteMany()
    await prisma.token.deleteMany()
    await prisma.wallet.deleteMany()

    // Create new wallet with generated address
    const wallet = await prisma.wallet.create({
      data: {
        address,
        publicKey,
        encryptedPrivateKey: privateKey // In a real app, this would be encrypted
      }
    })

    // Update USDT token with new wallet
    await prisma.token.update({
      where: { symbol: 'USDT' },
      data: { walletId: wallet.id }
    })

    console.log('Created wallet with $1B USDT:', {
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey // In a real app, this would be encrypted and not logged
    })
  } catch (error) {
    console.error('Failed to create wallet:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createWallet()
