import { NextResponse } from 'next/server'

// Mock database - in a real app, this would be a proper database
interface TokenInjection {
  id: string
  symbol: string
  amount: string
  price: string
  timestamp: string
}

let injections: TokenInjection[] = []
let tokens: any[] = [] // This would be properly typed and stored in a database

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-secret' // In production, use proper env variable

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, adminKey, symbol, amount, price } = body

    // Validate admin access
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    switch (action) {
      case 'inject': {
        // Validate required fields
        if (!symbol || !amount || !price) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields'
          }, { status: 400 })
        }

        // Create injection record
        const injection: TokenInjection = {
          id: Date.now().toString(),
          symbol,
          amount,
          price,
          timestamp: new Date().toISOString()
        }

        // Store injection record
        injections.push(injection)

        // Update token price and balance
        // In a real app, this would update the database
        const token = tokens.find(t => t.symbol === symbol)
        if (token) {
          token.price = parseFloat(price)
          token.balance = (parseFloat(token.balance) + parseFloat(amount)).toString()
        }

        return NextResponse.json({
          success: true,
          data: injection
        })
      }

      case 'getInjections': {
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
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET endpoint to fetch injection history
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const adminKey = searchParams.get('adminKey')

    // Validate admin access
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: {
        injections,
        tokens: tokens.filter(t => t.isForced) // Only return forced tokens
      }
    })
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch admin data'
    }, { status: 500 })
  }
}
