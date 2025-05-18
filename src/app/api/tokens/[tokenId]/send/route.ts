import { NextResponse } from 'next/server'

// Mock database - in a real app, this would be a proper database
interface Transaction {
  id: string
  tokenId: string
  type: 'send' | 'receive'
  amount: string
  recipient: string
  status: 'completed' | 'pending' | 'failed'
  timestamp: string
}

let transactions: Transaction[] = []

export async function POST(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const body = await req.json()
    const { amount, recipient } = body

    // Validate input
    if (!amount || !recipient) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Verify the user has sufficient balance
    // 2. Verify the recipient address is valid
    // 3. Execute the blockchain transaction
    // 4. Update the database with new balances

    // Create transaction record
    const transaction: Transaction = {
      id: Date.now().toString(),
      tokenId: params.tokenId,
      type: 'send',
      amount,
      recipient,
      status: 'completed', // In real app, this would initially be 'pending'
      timestamp: new Date().toISOString()
    }

    transactions.push(transaction)

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        status: transaction.status
      }
    })
  } catch (error) {
    console.error('Error processing transaction:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process transaction'
    }, { status: 500 })
  }
}

// GET endpoint to fetch transaction history
export async function GET(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    // Filter transactions for the specific token
    const tokenTransactions = transactions.filter(
      tx => tx.tokenId === params.tokenId
    )

    return NextResponse.json({
      success: true,
      data: tokenTransactions
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions'
    }, { status: 500 })
  }
}
