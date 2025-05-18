const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTransfer() {
  try {
    // Create recipient wallet
    const recipientWallet = await prisma.wallet.create({
      data: {
        address: '0x' + '2'.repeat(40),
        publicKey: 'test-public-key',
        encryptedPrivateKey: 'test-private-key'
      }
    })

    console.log('Created recipient wallet:', recipientWallet)

    // Get sender's USDT token
    const senderToken = await prisma.token.findFirst({
      where: { symbol: 'USDT' },
      include: { wallet: true }
    })

    if (!senderToken) {
      throw new Error('Sender USDT token not found')
    }

    console.log('Initial sender balance:', senderToken.balance)

    // Perform transfer
    const transferAmount = 1000000 // Transfer 1M USDT

    // Create or update recipient's USDT token
    const recipientToken = await prisma.token.create({
      data: {
        symbol: 'USDT',
        name: 'Tether USD',
        balance: transferAmount,
        price: senderToken.price,
        isForced: false,
        walletId: recipientWallet.id
      }
    })

    // Update sender's token balance
    await prisma.token.update({
      where: { id: senderToken.id },
      data: {
        balance: {
          decrement: transferAmount
        }
      }
    })

    // Create transaction records
    const [sendTx, receiveTx] = await Promise.all([
      // Sender's transaction
      prisma.transaction.create({
        data: {
          type: 'send',
          amount: transferAmount,
          status: 'completed',
          walletId: senderToken.walletId,
          tokenId: senderToken.id
        }
      }),
      // Recipient's transaction
      prisma.transaction.create({
        data: {
          type: 'receive',
          amount: transferAmount,
          status: 'completed',
          walletId: recipientWallet.id,
          tokenId: recipientToken.id
        }
      })
    ])

    // Get updated balances
    const [updatedSenderToken, updatedRecipientToken] = await Promise.all([
      prisma.token.findUnique({
        where: { id: senderToken.id },
        include: { wallet: true }
      }),
      prisma.token.findUnique({
        where: { id: recipientToken.id },
        include: { wallet: true }
      })
    ])

    console.log('\nTransfer complete!')
    console.log('Sender new balance:', updatedSenderToken.balance)
    console.log('Recipient balance:', updatedRecipientToken.balance)
    console.log('\nTransactions:', { sendTx, receiveTx })

  } catch (error) {
    console.error('Transfer test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTransfer()
