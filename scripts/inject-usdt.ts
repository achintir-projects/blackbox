import prisma from '../src/lib/prisma'

async function main() {
  try {
    // First, create a default admin wallet if it doesn't exist
    const adminWallet = await prisma.wallet.upsert({
      where: {
        address: process.env.NEXT_PUBLIC_USDT_CONTRACT || '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'
      },
      update: {},
      create: {
        address: process.env.NEXT_PUBLIC_USDT_CONTRACT || '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        publicKey: 'admin_public_key',
        encryptedPrivateKey: 'admin_encrypted_private_key'
      }
    })

    // First find if the token exists
    const existingToken = await prisma.token.findFirst({
      where: {
        AND: [
          { walletId: adminWallet.id },
          { symbol: 'USDT' }
        ]
      }
    })

    let token;
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
          contractAddress: process.env.NEXT_PUBLIC_USDT_CONTRACT || '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'
        }
      })
    }

    // Record the injection
    await prisma.tokenInjection.create({
      data: {
        tokenId: token.id,
        symbol: 'USDT',
        amount: 1000000000,
        price: 1.00
      }
    })

    console.log('USDT token injected successfully:', token)
  } catch (error) {
    console.error('Error injecting USDT:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
