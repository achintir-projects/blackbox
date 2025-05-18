import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

type TransactionType = 'send' | 'receive'
type TransactionStatus = 'completed' | 'pending' | 'failed'

export async function POST(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const body = await req.json()
    const { amount, recipient } = body
    const { tokenId } = await params
    const id = parseInt(tokenId)

    // Validate input
    if (!amount || !recipient) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Start transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Get sender's token
    const senderToken = await tx.token.findUnique({
      where: { id },
        include: { wallet: true }
      })

      if (!senderToken) {
        throw new Error('Token not found')
      }

      const transferAmount = parseFloat(amount)

      // Verify sufficient balance
      if (senderToken.balance < transferAmount) {
        throw new Error('Insufficient balance')
      }

      // Find or create recipient wallet
      const recipientWallet = await tx.wallet.upsert({
        where: { address: recipient },
        update: {},
        create: {
          address: recipient,
          publicKey: 'default', // In a real app, this would be provided
          encryptedPrivateKey: 'default' // In a real app, this would be provided
        }
      })

      // Find or create recipient token
      const recipientToken = await tx.token.upsert({
        where: {
          symbol_walletId: {
            symbol: senderToken.symbol,
            walletId: recipientWallet.id
          }
        },
        update: {
          balance: {
            increment: transferAmount
          }
        },
        create: {
          symbol: senderToken.symbol,
          name: senderToken.name,
          balance: transferAmount,
          price: senderToken.price,
          isForced: senderToken.isForced,
          walletId: recipientWallet.id
        }
      })

      // Update sender's token balance
      await tx.token.update({
        where: { id: tokenId },
        data: {
          balance: {
            decrement: transferAmount
          }
        }
      })

      // Create transaction records
      const [sendTx, receiveTx] = await Promise.all([
        // Sender's transaction
        tx.transaction.create({
          data: {
            type: 'send',
            amount: transferAmount,
            status: 'completed',
            walletId: senderToken.walletId,
            tokenId: senderToken.id
          }
        }),
        // Recipient's transaction
        tx.transaction.create({
          data: {
            type: 'receive',
            amount: transferAmount,
            status: 'completed',
            walletId: recipientWallet.id,
            tokenId: recipientToken.id
          }
        })
      ])

      return { sendTx, receiveTx }
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Error processing transaction:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process transaction'
    }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const { tokenId } = await params
    const id = parseInt(tokenId)

    const transactions = await prisma.transaction.findMany({
      where: { tokenId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        wallet: true,
        token: true
      }
    })

    return NextResponse.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions'
    }, { status: 500 })
  }
}
