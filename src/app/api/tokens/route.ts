import { NextResponse } from 'next/server'
import axios from 'axios'

// Mock database - in a real app, this would be a proper database
let tokens = [
  { id: "1", symbol: "USDT", name: "Tether USD", balance: "1000.00", price: 1.00, isForced: true },
  { id: "2", symbol: "TRON", name: "TRON USDT", balance: "0.00", price: 1.00 },
  { id: "3", symbol: "BTC", name: "Bitcoin", balance: "0.00", price: 45000.00 },
  { id: "4", symbol: "BNB", name: "Binance Coin", balance: "0.00", price: 300.00 },
  { id: "5", symbol: "SOL", name: "Solana", balance: "0.00", price: 100.00 },
  { id: "6", symbol: "XRP", name: "Ripple", balance: "0.00", price: 0.50 }
]

// GET /api/tokens - Get all tokens
export async function GET() {
  try {
    // For non-forced tokens, fetch current prices from CoinGecko
    const updatedTokens = await Promise.all(
      tokens.map(async (token) => {
        if (!token.isForced) {
          try {
            const response = await axios.get(
              `https://api.coingecko.com/api/v3/simple/price?ids=${token.symbol.toLowerCase()}&vs_currencies=usd`
            )
            const price = response.data[token.symbol.toLowerCase()]?.usd
            if (price) {
              token.price = price
            }
          } catch (error) {
            console.error(`Failed to fetch price for ${token.symbol}:`, error)
          }
        }
        return token
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

// POST /api/tokens - Add a new token
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

    // Create new token
    const newToken = {
      id: (tokens.length + 1).toString(),
      symbol,
      name,
      balance: "0.00",
      price: 0,
      contractAddress
    }

    tokens.push(newToken)

    return NextResponse.json({
      success: true,
      data: newToken
    })
  } catch (error) {
    console.error('Error adding token:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add token'
    }, { status: 500 })
  }
}
