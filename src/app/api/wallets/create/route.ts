import { NextResponse } from 'next/server'
import initUserWallet from '@/lib/init-user-wallet'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { address } = body

    console.log('Wallet creation API called with address:', address)

    if (!address) {
      console.log('Wallet creation failed: Address is required')
      return NextResponse.json({ success: false, error: 'Address is required' }, { status: 400 })
    }

    const { wallet, tokens } = await initUserWallet(address)

    console.log('Wallet creation successful:', wallet)

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        tokens
      }
    })
  } catch (error) {
    console.error('Error creating wallet:', error)
    return NextResponse.json({ success: false, error: 'Failed to create wallet' }, { status: 500 })
  }
}
