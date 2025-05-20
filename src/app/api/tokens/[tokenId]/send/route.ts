import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { senderWalletAddress, receiverWalletAddress, amount, tokenSymbol = 'USDT' } = body

    if (!senderWalletAddress || !receiverWalletAddress || !amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: senderWalletAddress, receiverWalletAddress, amount'
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

    // Fetch sender token balance by walletId and token symbol
    const senderToken = await prisma.token.findFirst({
      where: {
        walletId: senderWallet.id,
        symbol: tokenSymbol
      }
    })

    if (!senderToken) {
      return NextResponse.json({
        success: false,
        error: 'Sender token not found'
      }, { status: 404 })
    }

    if (senderToken.balance < amount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient balance'
      }, { status: 400 })
    }

    // Fetch or create receiver token
    let receiverToken = await prisma.token.findFirst({
      where: {
        walletId: receiverWallet.id,
        symbol: tokenSymbol
      }
    })

    if (!receiverToken) {
      receiverToken = await prisma.token.create({
        data: {
          walletId: receiverWallet.id,
          symbol: tokenSymbol,
          name: senderToken.name,
          balance: 0,
          price: senderToken.price,
          isForced: senderToken.isForced,
          contractAddress: senderToken.contractAddress
        }
      })
    }

    // Update balances atomically
    await prisma.$transaction([
      prisma.token.update({
        where: { id: senderToken.id },
        data: { balance: senderToken.balance - amount }
      }),
      prisma.token.update({
        where: { id: receiverToken.id },
        data: { balance: receiverToken.balance + amount }
      }),
      prisma.transaction.create({
        data: {
          tokenId: senderToken.id,
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
