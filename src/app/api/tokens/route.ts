import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { utils } from 'ethers'
import axios from 'axios'
import { getTokenDetails } from '@/lib/token-contract'

const prisma = new PrismaClient()

interface Token {
  id: number;
  walletId: number;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  isForced: boolean;
  contractAddress?: string | null;
  updatedAt: Date;
}

export async function GET() {
  try {
    const tokens = await prisma.token.findMany({
      orderBy: {
        symbol: 'asc'
      }
    })

    // Update prices for non-forced tokens
    const updatedTokens = await Promise.all(
      tokens.map(async (token: Token) => {
        if (!token.isForced) {
          try {
            const response = await axios.get(
              `https://api.coingecko.com/api/v3/simple/price?ids=${token.symbol.toLowerCase()}&vs_currencies=usd`
            )
            const price = response.data[token.symbol.toLowerCase()]?.usd
            if (price) {
              await prisma.token.update({
                where: { id: token.id },
                data: { price }
              })
              token.price = price
            }
          } catch (error) {
            console.error(`Failed to fetch price for ${token.symbol}:`, error)
          }
        }
        return {
          ...token,
          balance: token.balance.toString(),
          id: token.id.toString()
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: updatedTokens
    })
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tokens'
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { contractAddress } = await req.json()

    if (!contractAddress || !utils.isAddress(contractAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid contract address'
      }, { status: 400 })
    }

    // Get current user's wallet
    const wallet = await prisma.wallet.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: 'No wallet found'
      }, { status: 404 })
    }

    // Check if token already exists for this wallet
    const existingToken = await prisma.token.findFirst({
      where: {
        walletId: wallet.id,
        contractAddress
      }
    })

    if (existingToken) {
      return NextResponse.json({
        success: false,
        error: 'Token already added to this wallet'
      }, { status: 400 })
    }

    // Get token details from contract
    const tokenDetails = await getTokenDetails(contractAddress)
    if (!tokenDetails.success || !tokenDetails.data) {
      return NextResponse.json({
        success: false,
        error: tokenDetails.error || 'Failed to fetch token details'
      }, { status: 400 })
    }

    const { symbol, name, price } = tokenDetails.data

    // Create token with zero balance for current wallet
    const token = await prisma.token.create({
      data: {
        walletId: wallet.id,
        contractAddress,
        symbol,
        name,
        balance: 0,
        price: price || 0,
        isForced: false
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...token,
        balance: token.balance.toString(),
        id: token.id.toString()
      }
    })
  } catch (error) {
    console.error('Error adding token:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add token'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
