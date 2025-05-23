import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { utils } from 'ethers'
import axios from 'axios'
import { getTokenDetails } from '../../../lib/token-contract'

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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const walletAddress = url.searchParams.get('walletAddress')
    const tokenIdParam = url.searchParams.get('tokenId')

    if (tokenIdParam) {
      const tokenId = parseInt(tokenIdParam)
      const token = await prisma.token.findUnique({
        where: { id: tokenId }
      })

      if (!token) {
        return NextResponse.json({
          success: false,
          error: 'Token not found'
        }, { status: 404 })
      }

      // Update price for token if needed
      const hardcodedPrices: Record<string, number> = {
        btc: 102999,
        eth: 2387.38,
        bnb: 639.05
      }

      let price: number | undefined
      let change: number | undefined

      if (!token.isForced && token.symbol !== 'USDT') {
        try {
          if (hardcodedPrices[token.symbol.toLowerCase()]) {
            price = hardcodedPrices[token.symbol.toLowerCase()]
            change = 0
          } else {
            const response = await axios.get(
              `https://api.coingecko.com/api/v3/simple/price?ids=${token.symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`
            )
            price = response.data[token.symbol.toLowerCase()]?.usd
            change = response.data[token.symbol.toLowerCase()]?.usd_24h_change
          }

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

      return NextResponse.json({
        success: true,
        data: {
          ...token,
          priceChange24h: change,
          balance: token.balance.toString(),
          id: token.id.toString()
        }
      })
    }

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'walletAddress query parameter is required'
      }, { status: 400 })
    }

    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress }
    })

    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: 'Wallet not found'
      }, { status: 404 })
    }

    const tokens = await prisma.token.findMany({
      where: { walletId: wallet.id },
      orderBy: { symbol: 'asc' }
    })

    // Update prices for non-forced tokens with hardcoded prices for BTC, ETH, BNB
    const hardcodedPrices: Record<string, number> = {
      btc: 102999,
      eth: 2387.38,
      bnb: 639.05
    }

    const updatedTokens = await Promise.all(
      tokens.map(async (token: Token) => {
        if (!token.isForced && token.symbol !== 'USDT') {
          try {
            let price: number | undefined
            let change: number | undefined

            if (hardcodedPrices[token.symbol.toLowerCase()]) {
              price = hardcodedPrices[token.symbol.toLowerCase()]
              change = 0 // No change info for hardcoded prices
            } else {
              const response = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${token.symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`
              )
              price = response.data[token.symbol.toLowerCase()]?.usd
              change = response.data[token.symbol.toLowerCase()]?.usd_24h_change
            }

            if (price) {
              await prisma.token.update({
                where: { id: token.id },
                data: { price }
              })
              token.price = price
            }

            return {
              ...token,
              priceChange24h: change,
              balance: token.balance.toString(),
              id: token.id.toString()
            }
          } catch (error) {
            console.error(`Failed to fetch price for ${token.symbol}:`, error)
            return {
              ...token,
              balance: token.balance.toString(),
              id: token.id.toString()
            }
          }
        } else {
          return {
            ...token,
            balance: token.balance.toString(),
            id: token.id.toString()
          }
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

    const { symbol, name, price, decimals, chainId } = tokenDetails.data

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
