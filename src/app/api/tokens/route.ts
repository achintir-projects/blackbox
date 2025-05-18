import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'

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

interface TokenResponse {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  price: number;
  isForced: boolean;
  contractAddress?: string | null;
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
    const body = await req.json()
    const { contractAddress, symbol, name } = body

    // Validate input
    if (!contractAddress || !symbol || !name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Find default wallet
    const wallet = await prisma.wallet.findFirst({
      where: { address: 'default' }
    })

    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: 'No wallet found'
      }, { status: 404 })
    }

    // Create new token
    const token = await prisma.token.create({
      data: {
        symbol,
        name,
        contractAddress,
        walletId: wallet.id,
        balance: 0,
        price: 0
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
  }
}
