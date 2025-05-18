import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const body = await req.json()
    const { amount, recipient } = body
    const { tokenId } = params
    const id = parseInt(tokenId)

    // Validate input
    if (!amount || !recipient) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Start transaction to ensure atomicity within our internal system
    const result = await prisma.$transaction(async (tx: any) => {
      // Get sender's token
      const senderToken = await tx.token.findUnique({
        where: { id },
        include: { wallet: true }
      })

      if (!senderToken) {
        throw new Error('Token not found')
      }

      const transferAmount = parseFloat(amount)

      // Verify sufficient balance in our internal system
      if (senderToken.balance < transferAmount) {
        throw new Error('Insufficient balance')
      }

      // Find or create recipient wallet in our system
      const recipientWallet = await tx.wallet.upsert({
        where: { address: recipient },
        update: {},
        create: {
          address: recipient,
          publicKey: 'default',
          encryptedPrivateKey: 'default'
        }
      })

      // Find or create recipient token record
      const recipientToken = await tx.token.upsert({
        where: {
          walletId_symbol: {
            walletId: recipientWallet.id,
            symbol: senderToken.symbol
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

      // Update sender's token balance in our internal system
      await tx.token.update({
        where: { id },
        data: {
          balance: {
            decrement: transferAmount
          }
        }
      })

      // Create internal transaction records
      const [sendTx, receiveTx] = await Promise.all([
        // Sender's transaction record
        tx.transaction.create({
          data: {
            type: 'send',
            amount: transferAmount,
            status: 'completed',
            walletId: senderToken.walletId,
            tokenId: senderToken.id
          }
        }),
        // Recipient's transaction record
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
    console.error('Error processing internal transaction:', error)
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
    const { tokenId } = params
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
    console.error('Error fetching internal transactions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions'
    }, { status: 500 })
  }
}
