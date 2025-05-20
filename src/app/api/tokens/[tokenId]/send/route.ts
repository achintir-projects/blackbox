import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'

export async function POST(req: Request, context: { params: { tokenId: string } }) {
  try {
    const { tokenId } = context.params
    const body = await req.json()
    const { receiverWalletAddress, amount, senderWalletAddress } = body

    if (!receiverWalletAddress || !amount || !senderWalletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: receiverWalletAddress, amount, senderWalletAddress'
      }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Amount must be greater than zero'
      }, { status: 400 })
    }

    // Find sender wallet by address
    const senderWallet = await prisma.wallet.findUnique({
      where: { address: senderWalletAddress }
    })

    if (!senderWallet) {
      return NextResponse.json({
        success: false,
        error: 'Sender wallet not found'
      }, { status: 404 })
    }

    // Find receiver wallet by address
    const receiverWallet = await prisma.wallet.findUnique({
      where: { address: receiverWalletAddress }
    })

    if (!receiverWallet) {
      return NextResponse.json({
        success: false,
        error: 'Receiver wallet not found'
      }, { status: 404 })
    }

    // Find token by tokenId and sender wallet
    const token = await prisma.token.findFirst({
      where: {
        id: Number(tokenId),
        walletId: senderWallet.id
      }
    })

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token not found for sender wallet'
      }, { status: 404 })
    }

    if (token.balance < amount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient balance'
      }, { status: 400 })
    }

    // Fetch or create receiver token
    let receiverToken = await prisma.token.findFirst({
      where: {
        walletId: receiverWallet.id,
        symbol: token.symbol
      }
    })

    if (!receiverToken) {
      receiverToken = await prisma.token.create({
        data: {
          walletId: receiverWallet.id,
          symbol: token.symbol,
          name: token.name,
          balance: 0,
          price: token.price,
          isForced: token.isForced,
          contractAddress: token.contractAddress
        }
      })
    }

    // Update balances atomically
    await prisma.$transaction([
      prisma.token.update({
        where: { id: token.id },
        data: { balance: token.balance - amount }
      }),
      prisma.token.update({
        where: { id: receiverToken.id },
        data: { balance: receiverToken.balance + amount }
      }),
      prisma.transaction.create({
        data: {
          tokenId: token.id,
          walletId: senderWallet.id,
          type: 'send',
          amount,
          status: 'completed',
          createdAt: new Date()
        }
      }),
      prisma.transaction.create({
        data: {
          tokenId: receiverToken.id,
          walletId: receiverWallet.id,
          type: 'receive',
          amount,
          status: 'completed',
          createdAt: new Date()
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Tokens sent successfully'
    })
  } catch (error) {
    console.error('Error sending tokens:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send tokens'
    }, { status: 500 })
  }
}
