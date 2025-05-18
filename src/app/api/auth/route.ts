import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { initUserWallet } from '@/lib/init-user-wallet'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, privateKey } = body

    if (action === 'create') {
      let wallet
      let existingWallet

      // Keep generating new wallets until a unique address is found
      do {
        wallet = ethers.Wallet.createRandom()
        existingWallet = await prisma.wallet.findUnique({
          where: { address: wallet.address }
        })
      } while (existingWallet)

      // Initialize wallet with zero-balance tokens
      await initUserWallet(wallet.address, wallet.publicKey, wallet.privateKey)

      return NextResponse.json({
        success: true,
        data: {
          address: wallet.address,
          privateKey: wallet.privateKey,
        }
      })
    }
    
    else if (action === 'import') {
      // Validate and import existing wallet
      try {
        const wallet = new ethers.Wallet(privateKey)
        
        // Initialize wallet if it doesn't exist
        const existingWallet = await prisma.wallet.findUnique({
          where: { address: wallet.address }
        })

        if (!existingWallet) {
          await initUserWallet(wallet.address, wallet.publicKey, wallet.privateKey)
        }

        return NextResponse.json({
          success: true,
          data: {
            address: wallet.address,
            privateKey: wallet.privateKey,
          }
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Invalid private key'
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
