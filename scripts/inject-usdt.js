const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function injectUSDT() {
  try {
    // Create default wallet if it doesn't exist
    const wallet = await prisma.wallet.upsert({
      where: { address: 'default' },
      update: {},
      create: {
        address: 'default',
        publicKey: 'default',
        encryptedPrivateKey: 'default'
      }
    })

    // Create or update USDT token with $1B
    const token = await prisma.token.upsert({
      where: { symbol: 'USDT' },
      update: {
        balance: 1000000000,
        price: 1.00
      },
      create: {
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

    console.log('Successfully injected $1B USDT:', { token, injection })
  } catch (error) {
    console.error('Failed to inject USDT:', error)
  } finally {
    await prisma.$disconnect()
  }
}

injectUSDT()
