import prisma from '../src/lib/prisma'

async function injectUSDT() {
  try {
    // Create or get admin wallet
    const adminAddress = process.env.NEXT_PUBLIC_USDT_CONTRACT || '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'
    const adminWallet = await prisma.wallet.findUnique({
      where: { address: adminAddress }
    })

    if (!adminWallet) {
      throw new Error('Admin wallet not found')
    }

    // Find existing token
    const existingToken = await prisma.token.findFirst({
      where: {
        walletId: adminWallet.id,
        symbol: 'USDT'
      }
    })

    let token
    if (existingToken) {
      // Update existing token
      token = await prisma.token.update({
        where: { id: existingToken.id },
        data: {
          balance: 1000000000,
          price: 1.00,
          isForced: true
        }
      })
      console.log('Updated existing USDT token:', token)
    } else {
      // Create new token
      token = await prisma.token.create({
        data: {
          walletId: adminWallet.id,
          symbol: 'USDT',
          name: 'Tether USD',
          balance: 1000000000,
          price: 1.00,
          isForced: true,
          contractAddress: adminAddress
        }
      })
      console.log('Created new USDT token:', token)
    }

    // Record injection
    const injection = await prisma.tokenInjection.create({
      data: {
        tokenId: token.id,
        symbol: 'USDT',
        amount: 1000000000,
        price: 1.00
      }
    })
    console.log('Recorded token injection:', injection)

    return { success: true, token, injection }
  } catch (error) {
    console.error('Failed to inject USDT:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the injection
injectUSDT()
  .then(result => {
    if (!result.success) {
      process.exit(1)
    }
  })
  .catch(() => process.exit(1))
