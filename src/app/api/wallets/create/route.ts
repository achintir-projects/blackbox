import { NextResponse } from 'next/server'
import initUserWallet from '../../../../../scripts/init-user-wallet.js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { address } = body

    if (!address) {
      return NextResponse.json({ success: false, error: 'Address is required' }, { status: 400 })
    }

    const { wallet, tokens } = await initUserWallet(address)

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
