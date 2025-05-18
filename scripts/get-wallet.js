const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getWalletDetails() {
  try {
    const wallet = await prisma.wallet.findFirst({
      where: { address: 'default' },
      include: {
        tokens: true
      }
    })
    
    console.log('Wallet Details:', {
      address: wallet.address,
      publicKey: wallet.publicKey,
      encryptedPrivateKey: wallet.encryptedPrivateKey,
      tokens: wallet.tokens
    })
  } catch (error) {
    console.error('Failed to get wallet details:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getWalletDetails()
