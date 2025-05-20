import { NextResponse } from 'next/server'
import initUserWallet from '../../../../scripts/init-user-wallet.js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, walletName, password, privateKey } = body

    if (action === 'create') {
      // Create new wallet and initialize tokens
      const { wallet, tokens } = await initUserWallet()

      return NextResponse.json({
        success: true,
        data: {
          address: wallet.address,
          privateKey: wallet.encryptedPrivateKey // In real app, encrypt this
        }
      })
    } else if (action === 'import') {
      if (!privateKey) {
        return NextResponse.json({
          success: false,
          error: 'Private key is required for import'
        }, { status: 400 })
      }

      // Import wallet by private key and initialize tokens
      const { wallet, tokens } = await initUserWallet(null, null, privateKey)

      return NextResponse.json({
        success: true,
        data: {
          address: wallet.address,
          privateKey: wallet.encryptedPrivateKey
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in auth route:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 })
  }
}
