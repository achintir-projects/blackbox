const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    // Check wallets
    const wallets = await prisma.wallet.findMany()
    console.log('Wallets:', wallets)

    // Check tokens
    const tokens = await prisma.wallet.findMany({
      include: {
        tokens: true
      }
    })
    console.log('Tokens:', tokens)

  } catch (error) {
    console.error('Database check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
